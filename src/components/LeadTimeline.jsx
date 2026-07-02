import { useLeadTimeline } from '../hooks/useLeadTimeline.js'
import { fmtDateTime } from '../lib/format.js'

const EVENT_STYLE = {
  enviado: 'bg-cat-1/10 text-cat-1 border-cat-1/20',
  clique: 'bg-cat-2/10 text-cat-2 border-cat-2/20',
  resposta: 'bg-cat-5/10 text-cat-5 border-cat-5/20',
  opt_out: 'bg-status-critical/10 text-status-critical border-status-critical/20',
  transfer_humano: 'bg-status-good/10 text-status-good border-status-good/20',
  mensagem: 'bg-cat-7/10 text-cat-7 border-cat-7/20',
  evento: 'bg-plane text-ink-secondary border-rule',
}

export function LeadTimeline({ subscriberId }) {
  const { rows, error, loading, enabled } = useLeadTimeline(subscriberId)

  if (!enabled) {
    return (
      <div className="text-xs text-ink-muted">
        Este lead não tem <code className="font-mono">manychat_subscriber_id</code>, então não dá
        para carregar a timeline de <code className="font-mono">disparo_eventos</code>.
      </div>
    )
  }
  if (loading) return <div className="text-xs text-ink-muted">carregando timeline…</div>
  if (error)
    return (
      <div className="text-xs text-status-critical font-mono break-all">
        {error.message || String(error)}
      </div>
    )
  if (!rows.length)
    return <div className="text-xs text-ink-muted">Sem eventos registrados para este subscriber.</div>

  return (
    <ol className="flex flex-col gap-2">
      {rows.map((e) => {
        const dir = e.direcao || (['clique', 'resposta', 'opt_out'].includes(e.evento) ? 'lead' : 'bot')
        const isLead = dir === 'lead'
        const body =
          e.mensagem || e.resposta_texto || (e.botao ? `▸ ${e.botao}` : '') || `(${e.evento})`
        return (
          <li key={e.id} className={`flex ${isLead ? 'justify-end' : 'justify-start'}`}>
            <div
              className={
                isLead
                  ? 'max-w-[80%] bg-cat-2/10 border border-cat-2/20 rounded-lg rounded-br-none px-3 py-2'
                  : 'max-w-[80%] bg-surface border border-rule rounded-lg rounded-bl-none px-3 py-2'
              }
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span
                  className={`text-[10px] font-mono uppercase tracking-wider px-1.5 py-[1px] rounded border ${
                    EVENT_STYLE[e.evento] || EVENT_STYLE.evento
                  }`}
                >
                  {e.evento || 'evento'}
                </span>
                {e.passo ? (
                  <span className="text-[10px] font-mono text-ink-muted">{e.passo}</span>
                ) : null}
              </div>
              <div className="text-sm text-ink whitespace-pre-wrap break-words">{body}</div>
              <div className="text-[10px] font-mono text-ink-muted mt-1 text-right">
                {fmtDateTime(e.criado_em)}
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
