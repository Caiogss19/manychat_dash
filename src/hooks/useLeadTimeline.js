import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase, missingEnv } from '../lib/supabase.js'
import { TABLES } from '../lib/queries.js'

/**
 * Timeline unificada de mensagens de UM lead.
 *
 * Fontes:
 *   A) `disparo_eventos` — filtrada por `subscriber_id` (evento do ManyChat)
 *   B) `chatwoot_messages` — via chatwoot_contacts.phone_number = lead.telefone
 *
 * Shape unificado de cada item:
 *   { key, source, criado_em, direcao, tipo, conteudo, meta:{...} }
 *
 * @param {{subscriberId?: string|null, telefone?: string|null}} params
 */
export function useLeadTimeline({ subscriberId, telefone } = {}) {
  const [state, setState] = useState({
    items: [],
    counts: { disparo: 0, chatwoot: 0 },
    errors: { disparo: null, chatwoot: null },
    loading: true,
  })
  const alive = useRef(true)

  const enabled = Boolean(subscriberId) || Boolean(telefone)

  const run = useCallback(async () => {
    if (!enabled) {
      setState({ items: [], counts: { disparo: 0, chatwoot: 0 }, errors: { disparo: null, chatwoot: null }, loading: false })
      return
    }
    if (missingEnv || !supabase) {
      const e = new Error('Env VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY não estão configuradas.')
      setState({ items: [], counts: { disparo: 0, chatwoot: 0 }, errors: { disparo: e, chatwoot: e }, loading: false })
      return
    }
    setState((s) => ({ ...s, loading: true }))

    // Roda as duas queries em paralelo — falha isolada por fonte
    const disparoP = subscriberId
      ? supabase
          .from(TABLES.disparoEventos)
          .select('id, criado_em, evento, passo, direcao, botao, resposta_texto, mensagem')
          .eq('subscriber_id', subscriberId)
          .order('criado_em', { ascending: true })
      : Promise.resolve({ data: [], error: null })

    const chatwootP = telefone
      ? fetchChatwootByPhone(supabase, telefone)
      : Promise.resolve({ data: [], error: null })

    const [d, c] = await Promise.all([disparoP, chatwootP])
    if (!alive.current) return

    const items = []
    const errors = { disparo: null, chatwoot: null }
    const counts = { disparo: 0, chatwoot: 0 }

    if (d.error) errors.disparo = d.error
    else {
      for (const e of d.data || []) {
        items.push(normalizeDisparo(e))
        counts.disparo++
      }
    }
    if (c.error) errors.chatwoot = c.error
    else {
      for (const m of c.data || []) {
        items.push(normalizeChatwoot(m))
        counts.chatwoot++
      }
    }

    items.sort((a, b) => new Date(a.criado_em) - new Date(b.criado_em))
    setState({ items, counts, errors, loading: false })
  }, [subscriberId, telefone, enabled])

  useEffect(() => {
    alive.current = true
    run()
    return () => { alive.current = false }
  }, [run])

  return { ...state, refetch: run, enabled }
}

async function fetchChatwootByPhone(sb, phone) {
  // 1) contato pelo telefone (aceita com e sem "+")
  const p = String(phone).trim()
  const alt = p.startsWith('+') ? p.slice(1) : `+${p}`
  const { data: contacts, error: eC } = await sb
    .from(TABLES.chatwootContacts)
    .select('id, phone_number, name')
    .in('phone_number', [p, alt])
  if (eC) return { data: null, error: eC }
  if (!contacts || !contacts.length) return { data: [], error: null }

  // 2) todas as conversas desses contatos
  const contactIds = contacts.map((c) => c.id)
  const { data: convs, error: eV } = await sb
    .from(TABLES.chatwootConversations)
    .select('id, contact_id, status')
    .in('contact_id', contactIds)
  if (eV) return { data: null, error: eV }
  if (!convs || !convs.length) return { data: [], error: null }

  // 3) mensagens de todas as conversas
  const convIds = convs.map((c) => c.id)
  const { data: msgs, error: eM } = await sb
    .from(TABLES.chatwootMessages)
    .select('id, conversation_id, content, sender_type, message_type, private, created_at')
    .in('conversation_id', convIds)
    .order('created_at', { ascending: true })
  if (eM) return { data: null, error: eM }
  return { data: msgs || [], error: null }
}

function normalizeDisparo(e) {
  const dir = e.direcao || (['clique', 'resposta', 'opt_out'].includes(e.evento) ? 'lead' : 'bot')
  const conteudo =
    e.mensagem ||
    e.resposta_texto ||
    (e.botao ? `▸ ${e.botao}` : '') ||
    `(${e.evento || 'evento'})`
  return {
    key: `d-${e.id}`,
    source: 'manychat',
    criado_em: e.criado_em,
    direcao: dir === 'lead' ? 'lead' : 'bot',
    tipo: e.evento || 'evento',
    conteudo,
    meta: { passo: e.passo || '' },
  }
}

function normalizeChatwoot(m) {
  const isPrivate = Boolean(m.private)
  // sender_type: 'Contact' = lead, 'User' = agente humano, 'AgentBot' = bot
  const sender = String(m.sender_type || '').toLowerCase()
  const direcao =
    sender === 'contact' ? 'lead' : sender === 'agentbot' ? 'bot' : 'agente'
  return {
    key: `c-${m.id}`,
    source: 'chatwoot',
    criado_em: m.created_at,
    direcao,
    tipo: isPrivate ? 'nota interna' : `chatwoot msg`,
    conteudo: m.content || '(sem texto)',
    meta: { sender_type: m.sender_type, private: isPrivate, message_type: m.message_type },
  }
}
