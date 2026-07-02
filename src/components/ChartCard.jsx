import { StateBoundary } from './StateBoundary.jsx'

/**
 * Wrapper de card para cada gráfico — cuida do estado (loading/erro/vazio) e header.
 *
 * <ChartCard title="…" subtitle="…" loading={…} error={…} empty={…} onRefetch={…} action={…}>
 *   {children}
 * </ChartCard>
 */
export function ChartCard({
  title,
  subtitle,
  loading,
  error,
  empty,
  onRefetch,
  action,
  height = 260,
  children,
  className = '',
}) {
  return (
    <div className={`rounded-lg bg-surface shadow-card p-5 ${className}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="text-sm font-semibold text-ink">{title}</h3>
          {subtitle ? <p className="text-xs text-ink-secondary mt-0.5">{subtitle}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div style={{ height }} className="relative">
        <StateBoundary loading={loading} error={error} empty={empty} onRefetch={onRefetch}>
          {children}
        </StateBoundary>
      </div>
    </div>
  )
}
