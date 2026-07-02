/** Tooltip customizado — mesma linguagem visual em todos os gráficos. */
export function ChartTooltip({ active, payload, label, labelFormatter, valueFormatter }) {
  if (!active || !payload || !payload.length) return null
  return (
    <div className="rounded bg-ink text-surface text-xs px-2.5 py-1.5 shadow-lg">
      {label != null ? (
        <div className="text-[10px] uppercase tracking-wider opacity-70 mb-1">
          {labelFormatter ? labelFormatter(label) : label}
        </div>
      ) : null}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 tabular-nums">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: p.color || p.payload.fill }} />
          <span className="opacity-80">{p.name}:</span>
          <span className="font-semibold">
            {valueFormatter ? valueFormatter(p.value, p) : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}
