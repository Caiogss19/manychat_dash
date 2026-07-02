import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { COLORS, labelFor } from '../../lib/theme.js'
import { ChartTooltip } from './ChartTooltip.jsx'
import { fmtInt } from '../../lib/format.js'

const COLOR_BY_DIR = {
  out: COLORS.cat[0], // bot → blue
  bot: COLORS.cat[0],
  in: COLORS.cat[1], // lead → aqua
  lead: COLORS.cat[1],
}

export function MsgsDirecaoChart({ rows }) {
  const data = rows.map((r) => ({
    name: labelFor('direcao', r.direcao),
    key: r.direcao,
    qtd: Number(r.qtd) || 0,
  }))
  return (
    <ResponsiveContainer>
      <BarChart data={data} margin={{ top: 8, right: 12, bottom: 6, left: 6 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="name" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} width={30} allowDecimals={false} />
        <Tooltip
          cursor={{ fill: COLORS.rule, opacity: 0.4 }}
          content={<ChartTooltip valueFormatter={(v) => `${fmtInt(v)} msgs`} />}
        />
        <Bar dataKey="qtd" name="Mensagens" radius={[4, 4, 0, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={COLOR_BY_DIR[d.key] || COLORS.cat[0]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
