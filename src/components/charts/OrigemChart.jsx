import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { COLORS } from '../../lib/theme.js'
import { ChartTooltip } from './ChartTooltip.jsx'
import { fmtInt } from '../../lib/format.js'

/** Pizza da origem. Aloca cores em slot fixo por origem (ordem determinística). */
export function OrigemChart({ rows }) {
  const data = rows.map((r, i) => ({
    name: r.origem || 'desconhecido',
    value: Number(r.qtd) || 0,
    fill: COLORS.cat[i % COLORS.cat.length],
  }))
  return (
    <ResponsiveContainer>
      <PieChart>
        <Tooltip content={<ChartTooltip valueFormatter={(v) => `${fmtInt(v)} leads`} />} />
        <Legend
          verticalAlign="bottom"
          iconSize={9}
          wrapperStyle={{ fontSize: 11, color: COLORS.inkSecondary }}
        />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="45%"
          innerRadius={45}
          outerRadius={78}
          stroke={COLORS.surface}
          strokeWidth={2}
        >
          {data.map((d, i) => (
            <Cell key={i} fill={d.fill} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  )
}
