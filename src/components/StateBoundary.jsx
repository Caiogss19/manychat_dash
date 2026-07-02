/**
 * Renderiza um dos 4 estados:
 *  - loading → skeleton
 *  - error   → mensagem vermelha + botão retry
 *  - empty   → mensagem cinza
 *  - default → children
 */
export function StateBoundary({ loading, error, empty, onRefetch, children }) {
  if (loading) return <Skeleton />
  if (error) return <ErrorState error={error} onRefetch={onRefetch} />
  if (empty) return <EmptyState />
  return children
}

function Skeleton() {
  return (
    <div className="w-full h-full flex items-end gap-2 px-2 pb-2 opacity-40">
      {[38, 62, 44, 78, 55, 90, 40, 66].map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-t bg-rule animate-pulse"
          style={{ height: `${h}%`, animationDelay: `${i * 60}ms` }}
        />
      ))}
    </div>
  )
}

function ErrorState({ error, onRefetch }) {
  const msg = error?.message || error?.details || String(error) || 'Erro desconhecido'
  return (
    <div className="w-full h-full flex flex-col items-start justify-center gap-2 p-4 rounded border border-status-critical/20 bg-status-critical/[0.04]">
      <div className="text-xs font-medium text-status-critical uppercase tracking-wide">
        Falha na query
      </div>
      <div className="text-sm text-ink font-mono break-all">{msg}</div>
      {onRefetch ? (
        <button
          onClick={onRefetch}
          className="mt-1 text-xs px-2 py-1 rounded border border-rule-strong hover:bg-plane"
        >
          ↻ Tentar novamente
        </button>
      ) : null}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="w-full h-full flex items-center justify-center text-sm text-ink-muted">
      Sem dados nesta janela.
    </div>
  )
}
