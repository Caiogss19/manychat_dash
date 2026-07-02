import { fmtInt, fmtPct } from '../lib/format.js'

/**
 * <MetricCard label="Total" value={123} intent="primary" />
 * intent: primary | good | warning | critical | aqua | violet | neutral
 * kind:   int (default) | pct
 * hint:   texto secundário
 * accent: cor da barra do topo (fallback do intent)
 */
export function MetricCard({ label, value, hint, intent = 'primary', kind = 'int', accent, loading, error }) {
  const intentAccent = {
    primary: '#2a78d6',
    good: '#0ca30c',
    warning: '#fab219',
    critical: '#d03b3b',
    aqua: '#1baf7a',
    violet: '#4a3aa7',
    neutral: '#898781',
  }[intent] || '#2a78d6'
  const bar = accent || intentAccent

  const display = error
    ? 'erro'
    : loading
      ? '—'
      : kind === 'pct'
        ? fmtPct(value)
        : fmtInt(value)

  return (
    <div className="relative rounded-lg bg-surface shadow-card p-4 min-h-[104px] overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[3px]" style={{ background: bar }} />
      <div className="text-[10.5px] font-medium tracking-[0.1em] uppercase text-ink-muted">{label}</div>
      <div className="mt-2 text-3xl font-semibold text-ink tabular-nums leading-none">{display}</div>
      {hint ? <div className="mt-2 text-xs text-ink-secondary">{hint}</div> : null}
      {error ? (
        <div className="mt-2 text-xs text-status-critical">{String(error.message || error)}</div>
      ) : null}
    </div>
  )
}
