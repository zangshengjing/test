import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

export interface RadarDatum {
  dimension: string
  score: number
  [key: string]: string | number
}

/** 维度雷达图（支持最近两次体检对比） */
export function DimensionRadar({
  data,
  second,
}: {
  data: RadarDatum[]
  second?: { key: string; data: RadarDatum[] }
}) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke="rgba(255,255,255,0.12)" />
        <PolarAngleAxis
          dataKey="dimension"
          tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 12 }}
        />
        {second && (
          <Radar
            name={second.key}
            dataKey="score"
            stroke="#38BDF8"
            fill="#38BDF8"
            fillOpacity={0.18}
            strokeWidth={2}
          />
        )}
        <Radar
          name="当前"
          dataKey="score"
          stroke="#FFB300"
          fill="#FF6B6B"
          fillOpacity={0.32}
          strokeWidth={2}
        />
        <Tooltip
          contentStyle={{
            background: 'rgba(17,24,39,0.92)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 12,
            fontSize: 12,
          }}
          labelStyle={{ color: 'rgba(255,255,255,0.8)' }}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
