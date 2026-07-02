import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { COLORS } from '../../lib/theme.js'
import { ChartTooltip } from './ChartTooltip.jsx'
import { fmtInt } from '../../lib/format.js'

export function DistribuicaoChart({ rows }) {
  const data = rows.map((r) => ({ valor: r.valor || '—', qtd: Number(r.qtd) || 0 }))
  return (
    <ResponsiveContainer>
      <BarChart data={data} margin={{ top: 8, right: 12, bottom: 6, left: 6 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="valor" tickLine={false} axisLine={false} interval={0} />
        <YAxis tickLine={false} axisLine={false} width={30} allowDecimals={false} />
        <Tooltip
          cursor={{ fill: COLORS.rule, opacity: 0.4 }}
          content={<ChartTooltip valueFormatter={(v) => `${fmtInt(v)} leads`} />}
        />
        <Bar dataKey="qtd" name="Leads" fill={COLORS.cat[0]} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
