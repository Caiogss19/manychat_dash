import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { COLORS } from '../../lib/theme.js'
import { ChartTooltip } from './ChartTooltip.jsx'
import { fmtInt } from '../../lib/format.js'

/** Barras horizontais — ordinal single-hue (sequential blue). */
export function FunilChart({ rows }) {
  const data = rows.map((r) => ({ passo: r.passo || '—', eventos: Number(r.eventos) || 0 }))
  const max = Math.max(1, ...data.map((d) => d.eventos))

  return (
    <ResponsiveContainer>
      <BarChart data={data} layout="vertical" margin={{ top: 6, right: 24, bottom: 6, left: 12 }}>
        <CartesianGrid strokeDasharray="0" horizontal={false} />
        <XAxis type="number" tickLine={false} axisLine={false} allowDecimals={false} />
        <YAxis
          dataKey="passo"
          type="category"
          tickLine={false}
          axisLine={false}
          width={170}
          interval={0}
        />
        <Tooltip
          cursor={{ fill: COLORS.rule, opacity: 0.4 }}
          content={<ChartTooltip valueFormatter={(v) => `${fmtInt(v)} eventos`} />}
        />
        <Bar dataKey="eventos" name="Eventos" radius={[0, 4, 4, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={interpolate(COLORS.seqStart, COLORS.seqEnd, d.eventos / max)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

function interpolate(a, b, t) {
  const to = (h) => [
    parseInt(h.slice(1, 3), 16),
    parseInt(h.slice(3, 5), 16),
    parseInt(h.slice(5, 7), 16),
  ]
  const [ar, ag, ab] = to(a)
  const [br, bg, bb] = to(b)
  const mix = (x, y) => Math.round(x + (y - x) * Math.max(0, Math.min(1, t)))
  return `#${[mix(ar, br), mix(ag, bg), mix(ab, bb)]
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('')}`
}
