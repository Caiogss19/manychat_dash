import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { COLORS } from '../../lib/theme.js'
import { ChartTooltip } from './ChartTooltip.jsx'
import { fmtDate, fmtInt } from '../../lib/format.js'

export function MsgsDiaChart({ rows }) {
  const data = rows.map((r) => ({ dia: String(r.dia), mensagens: Number(r.mensagens) || 0 }))
  return (
    <ResponsiveContainer>
      <ComposedChart data={data} margin={{ top: 8, right: 12, bottom: 6, left: 6 }}>
        <defs>
          <linearGradient id="gMsgsDia" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLORS.cat[1]} stopOpacity={0.22} />
            <stop offset="100%" stopColor={COLORS.cat[1]} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="dia"
          tickLine={false}
          axisLine={false}
          tickFormatter={fmtDate}
          minTickGap={24}
        />
        <YAxis tickLine={false} axisLine={false} width={30} allowDecimals={false} />
        <Tooltip
          content={
            <ChartTooltip
              labelFormatter={(l) => fmtDate(l)}
              valueFormatter={(v) => `${fmtInt(v)} mensagens`}
            />
          }
        />
        <Area type="monotone" dataKey="mensagens" fill="url(#gMsgsDia)" stroke="transparent" />
        <Line
          type="monotone"
          dataKey="mensagens"
          stroke={COLORS.cat[1]}
          strokeWidth={2}
          dot={{ r: 3, fill: COLORS.cat[1], stroke: COLORS.surface, strokeWidth: 2 }}
          activeDot={{ r: 5 }}
          name="Mensagens"
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
