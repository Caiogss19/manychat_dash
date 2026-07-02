const nfInt = new Intl.NumberFormat('pt-BR')
const nfPct1 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

export function fmtInt(n) {
  if (n == null || Number.isNaN(Number(n))) return '—'
  return nfInt.format(Number(n))
}

export function fmtPct(n, { fromFraction = false } = {}) {
  if (n == null || Number.isNaN(Number(n))) return '—'
  const v = fromFraction ? Number(n) * 100 : Number(n)
  return `${nfPct1.format(v)}%`
}

export function fmtDate(d) {
  if (!d) return '—'
  const dt = new Date(d)
  if (Number.isNaN(+dt)) return '—'
  return dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

export function fmtDateTime(d) {
  if (!d) return '—'
  const dt = new Date(d)
  if (Number.isNaN(+dt)) return '—'
  return dt.toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  })
}

// Comparações de dia (YYYY-MM-DD) sem timezone drift
export function dayISO(d) {
  const dt = new Date(d)
  const y = dt.getFullYear()
  const m = String(dt.getMonth() + 1).padStart(2, '0')
  const day = String(dt.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function daysAgoISO(days) {
  const dt = new Date()
  dt.setHours(0, 0, 0, 0)
  dt.setDate(dt.getDate() - days)
  return dayISO(dt)
}

export function daysAgoISOInstant(days) {
  // instant (com hora) — para filtrar timestamps
  const dt = new Date()
  dt.setDate(dt.getDate() - days)
  return dt.toISOString()
}
