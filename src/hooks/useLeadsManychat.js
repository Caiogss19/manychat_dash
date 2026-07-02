import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { TABLES } from '../lib/queries.js'
import { daysAgoISOInstant } from '../lib/format.js'

const SELECT = [
  'id',
  'nome',
  'telefone',
  'empresa',
  'cargo',
  'status_bot',
  'is_sql',
  'is_handoff',
  'origem_ref_tabela',
  'canal',
  'qualificacao',
  'criado_em',
  'manychat_subscriber_id',
  'ultima_resposta',
].join(',')

/**
 * Tabela paginada + filtros server-side (status_bot, is_sql, range, busca)
 * @param {Object} filters
 * @param {string} filters.statusBot   '__all__' | 'completo' | 'em_andamento' | 'timeout' | 'handoff'
 * @param {null|boolean} filters.isSql true = só SQL, false = só não-SQL, null = todos
 * @param {number|null} filters.days   janela sobre criado_em; null = tudo
 * @param {string} filters.search      nome ou telefone
 * @param {number} filters.page        0-based
 * @param {number} filters.pageSize
 */
export function useLeadsManychat(filters) {
  const [state, setState] = useState({ rows: [], count: 0, error: null, loading: true })
  const alive = useRef(true)

  const run = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }))
    let q = supabase.from(TABLES.leadsManychat).select(SELECT, { count: 'exact' })

    if (filters.statusBot && filters.statusBot !== '__all__') {
      q = q.eq('status_bot', filters.statusBot)
    }
    if (filters.isSql !== null && filters.isSql !== undefined) {
      q = q.eq('is_sql', filters.isSql)
    }
    if (filters.days != null) {
      q = q.gte('criado_em', daysAgoISOInstant(filters.days))
    }
    const s = (filters.search || '').trim()
    if (s.length >= 2) {
      const like = `%${s.replace(/[%_]/g, '')}%`
      q = q.or(`nome.ilike.${like},telefone.ilike.${like},empresa.ilike.${like}`)
    }
    q = q.order('criado_em', { ascending: false })

    const from = filters.page * filters.pageSize
    const to = from + filters.pageSize - 1
    q = q.range(from, to)

    const { data, count, error } = await q
    if (!alive.current) return
    if (error) setState({ rows: [], count: 0, error, loading: false })
    else setState({ rows: data || [], count: count || 0, error: null, loading: false })
  }, [
    filters.statusBot,
    filters.isSql,
    filters.days,
    filters.search,
    filters.page,
    filters.pageSize,
  ])

  useEffect(() => {
    alive.current = true
    run()
    return () => { alive.current = false }
  }, [run])

  return { ...state, refetch: run }
}
