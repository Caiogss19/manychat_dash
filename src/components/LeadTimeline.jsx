import { useLeadTimeline } from '../hooks/useLeadTimeline.js'
import { fmtDateTime, fmtInt } from '../lib/format.js'

const TIPO_STYLE = {
  // ManyChat
  enviado: 'bg-cat-1/10 text-cat-1 border-cat-1/20',
  clique: 'bg-cat-2/10 text-cat-2 border-cat-2/20',
  resposta: 'bg-cat-5/10 text-cat-5 border-cat-5/20',
  opt_out: 'bg-status-critical/10 text-status-critical border-status-critical/20',
  transfer_humano: 'bg-status-good/10 text-status-good border-status-good/20',
  mensagem: 'bg-cat-7/10 text-cat-7 border-cat-7/20',
  evento: 'bg-plane text-ink-secondary border-rule',
  // Chatwoot
  'chatwoot msg': 'bg-cat-3/10 text-cat-3 border-cat-3/25',
  'nota interna': 'bg-status-warning/10 text-status-warning border-status-warning/25',
}

const SOURCE_STYLE = {
  manychat: 'bg-cat-1/8 text-cat-1 border-cat-1/25',
  chatwoot: 'bg-cat-3/10 text-cat-3 border-cat-3/30',
}

export function LeadTimeline({ subscriberId, telefone }) {
  const { items, counts, errors, loading, enabled, refetch } = useLeadTimeline({ subscriberId, telefone })

  if (!enabled) {
    return (
      <div className="text-xs text-ink-muted">
        Sem <code className="font-mono">subscriber_id</code> nem <code className="font-mono">telefone</code>{' '}
        neste lead — nada pra buscar.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* header — contadores por fonte e retry */}
      <div className="flex items-center gap-2 text-[11px] flex-wrap">
        <span className="text-ink-muted font-mono uppercase tracking-wider">Histórico</span>
        <SourcePill n={counts.manychat ?? counts.disparo} label="ManyChat" source="manychat" />
        <SourcePill n={counts.chatwoot} label="Chatwoot" source="chatwoot" />
        <button
          onClick={refetch}
          className="ml-auto text-[11px] px-2 py-0.5 rounded border border-rule-strong hover:bg-plane"
        >
          ↻ Atualizar
        </button>
      </div>

      {/* erros isolados por fonte (aparecem inline, não bloqueiam a outra fonte) */}
      {errors.disparo ? (
        <SourceError source="ManyChat (disparo_eventos)" err={errors.disparo} />
      ) : null}
      {errors.chatwoot ? (
        <SourceError source="Chatwoot (chatwoot_messages)" err={errors.chatwoot} />
      ) : null}

      {loading ? (
        <div className="text-xs text-ink-muted">carregando conversa…</div>
      ) : items.length === 0 && !errors.disparo && !errors.chatwoot ? (
        <div className="text-xs text-ink-muted">
          Sem mensagens registradas ainda. Fontes: <code className="font-mono">disparo_eventos</code>{' '}
          por <code className="font-mono">subscriber_id</code> · <code className="font-mono">chatwoot_messages</code>{' '}
          por telefone.
        </div>
      ) : (
        <ol className="flex flex-col gap-2">
          {items.map((it) => (
            <Bubble key={it.key} it={it} />
          ))}
        </ol>
      )}
    </div>
  )
}

function Bubble({ it }) {
  const isLead = it.direcao === 'lead'
  const align = isLead ? 'justify-end' : 'justify-start'
  const bg =
    it.direcao === 'lead'
      ? 'bg-cat-2/10 border border-cat-2/25 rounded-lg rounded-br-none'
      : it.direcao === 'agente'
        ? 'bg-cat-3/8 border border-cat-3/25 rounded-lg rounded-bl-none'
        : 'bg-surface border border-rule rounded-lg rounded-bl-none'
  const dirLabel = it.direcao === 'lead' ? 'lead' : it.direcao === 'agente' ? 'agente' : 'bot'
  return (
    <li className={`flex ${align}`}>
      <div className={`max-w-[82%] px-3 py-2 ${bg}`}>
        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
          <span
            className={`text-[10px] font-mono uppercase tracking-wider px-1.5 py-[1px] rounded border ${
              SOURCE_STYLE[it.source] || 'bg-plane text-ink-muted border-rule'
            }`}
          >
            {it.source}
          </span>
          <span
            className={`text-[10px] font-mono uppercase tracking-wider px-1.5 py-[1px] rounded border ${
              TIPO_STYLE[it.tipo] || TIPO_STYLE.evento
            }`}
          >
            {it.tipo}
          </span>
          <span className="text-[10px] font-mono text-ink-muted">{dirLabel}</span>
          {it.meta?.passo ? (
            <span className="text-[10px] font-mono text-ink-muted">· {it.meta.passo}</span>
          ) : null}
        </div>
        <div className="text-sm text-ink whitespace-pre-wrap break-words">{it.conteudo}</div>
        <div className="text-[10px] font-mono text-ink-muted mt-1 text-right">
          {fmtDateTime(it.criado_em)}
        </div>
      </div>
    </li>
  )
}

function SourcePill({ n, label, source }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border font-mono ${
        SOURCE_STYLE[source] || 'bg-plane text-ink-muted border-rule'
      }`}
    >
      {label} <span className="font-semibold">{fmtInt(n || 0)}</span>
    </span>
  )
}

function SourceError({ source, err }) {
  return (
    <div className="rounded border border-status-critical/25 bg-status-critical/[0.04] p-2">
      <div className="text-[10px] font-mono uppercase tracking-wide text-status-critical">
        Falha em {source}
      </div>
      <div className="text-xs text-ink font-mono break-all">{err.message || String(err)}</div>
    </div>
  )
}
