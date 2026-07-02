import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { COLORS } from '../../lib/theme.js'
import { ChartTooltip } from './ChartTooltip.jsx'
import { fmtInt } from '../../lib/format.js'
import { labelFor } from '../../lib/theme.js'

const STATUS_COLOR = {
  completo: COLORS.good,
  em_andamento: COLORS.warning,
  timeout: COLORS.critical,
  handoff: COLORS.cat[4], // violet
  novo: COLORS.cat[0], // blue
}

export function StatusChart({ rows }) {
  const data = rows.map((r) => ({
    name: labelFor('status_bot', r.status_bot),
    key: r.status_bot,
    value: Number(r.qtd) || 0,
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
            <Cell key={i} fill={STATUS_COLOR[d.key] || COLORS.cat[i % COLORS.cat.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  )
}
