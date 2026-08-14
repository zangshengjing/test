import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

/** 周完成率趋势折线 */
export function TrendChart({
  data,
  height = 220,
}: {
  data: { label: string; rate: number; score?: number }[]
  height?: number
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFB300" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#FFB300" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: 'rgba(17,24,39,0.92)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 12,
            fontSize: 12,
          }}
          formatter={(v) => [`${v}%`, '完成率']}
        />
        <Area
          type="monotone"
          dataKey="rate"
          stroke="#FFB300"
          strokeWidth={2.5}
          fill="url(#trendFill)"
          activeDot={{ r: 4, fill: '#FF6B6B' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
