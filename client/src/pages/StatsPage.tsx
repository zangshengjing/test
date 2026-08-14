import { useEffect, useMemo, useState } from 'react'
import { CalendarCheck2, Clock3, Flame, TrendingUp } from 'lucide-react'
import { useProgressStore } from '../store/useProgressStore'
import { Heatmap } from '../components/charts/Heatmap'
import { TrendChart } from '../components/charts/TrendChart'
import { DimensionRadar } from '../components/charts/DimensionRadar'
import { DIMENSION_LABELS } from '../lib/constants'
import { cn } from '../lib/utils'

type TrendMode = 'rate' | 'score'

export default function StatsPage() {
  const stats = useProgressStore((s) => s.stats)
  const version = useProgressStore((s) => s.version)
  const fetchStats = useProgressStore((s) => s.fetchStats)
  const [mode, setMode] = useState<TrendMode>('rate')

  useEffect(() => {
    fetchStats()
  }, [version, fetchStats])

  const trendData = useMemo(
    () =>
      (stats?.trend ?? []).map((t) => ({
        label: `${Number(t.date.slice(5, 7))}/${Number(t.date.slice(8, 10))}`,
        rate: t.rate,
        score: t.score ?? 0,
      })),
    [stats]
  )

  const dimensionHistory = stats?.dimensionHistory ?? []
  const hasHistory = dimensionHistory.length >= 2
  const radarData = useMemo(() => {
    const latest = dimensionHistory[dimensionHistory.length - 1]
    if (!latest) return []
    return (Object.keys(DIMENSION_LABELS) as (keyof typeof DIMENSION_LABELS)[]).map((id) => ({
      dimension: DIMENSION_LABELS[id],
      score: latest.scores[id] ?? 0,
    }))
  }, [dimensionHistory])

  const prevRadar = useMemo(() => {
    if (!hasHistory) return undefined
    const prev = dimensionHistory[dimensionHistory.length - 2]
    return {
      key: `${Number(prev.date.slice(5, 7))}/${Number(prev.date.slice(8, 10))}`,
      data: (Object.keys(DIMENSION_LABELS) as (keyof typeof DIMENSION_LABELS)[]).map((id) => ({
        dimension: DIMENSION_LABELS[id],
        score: prev.scores[id] ?? 0,
      })),
    }
  }, [dimensionHistory, hasHistory])

  if (!stats) {
    return (
      <div className="space-y-5">
        <h1 className="text-2xl font-bold">统计</h1>
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-in fade-in-0 duration-500">
      <div>
        <h1 className="text-2xl font-bold">成长统计</h1>
        <p className="mt-1 text-sm text-muted-foreground">坚持的每一步，都算数</p>
      </div>

      {/* 指标卡 */}
      <section className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          icon={<Flame className="h-5 w-5 text-coral" />}
          label="连续打卡天数"
          value={`${stats.streakDays} 天`}
          accent="text-coral"
        />
        <MetricCard
          icon={<TrendingUp className="h-5 w-5 text-success" />}
          label="本周完成率"
          value={`${stats.weekRate}%`}
          accent="text-success"
        />
        <MetricCard
          icon={<Clock3 className="h-5 w-5 text-info" />}
          label="累计投入时长"
          value={`${Math.floor(stats.totalDurationMin / 60)}h ${stats.totalDurationMin % 60}m`}
          accent="text-info"
        />
      </section>

      {/* 热力图 */}
      <section className="glass rounded-3xl p-5">
        <div className="mb-4 flex items-center gap-2">
          <CalendarCheck2 className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold">打卡热力图</h2>
          <span className="ml-auto text-xs text-muted-foreground">近 90 天 · 今日 {stats.todayCompleted}/{stats.todayTotal}</span>
        </div>
        <Heatmap data={stats.heatmap} />
      </section>

      {/* 趋势 */}
      <section className="glass rounded-3xl p-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-base font-semibold">趋势分析</h2>
          <div className="flex gap-1 rounded-lg bg-black/5 p-0.5">
            {(['rate', 'score'] as TrendMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  'rounded-md px-3 py-1 text-xs transition-all',
                  mode === m ? 'bg-white/90 text-foreground shadow-sm' : 'text-muted-foreground'
                )}
              >
                {m === 'rate' ? '完成率' : '成长分'}
              </button>
            ))}
          </div>
        </div>
        {mode === 'score' && !hasHistory ? (
          <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
            完成至少两次体检后展示成长分趋势
          </div>
        ) : (
          <TrendChart
            data={mode === 'rate' ? trendData : trendData.map((d) => ({ ...d, rate: d.score }))}
          />
        )}
      </section>

      {/* 维度成长对比 */}
      {hasHistory && (
        <section className="glass rounded-3xl p-5">
          <h2 className="mb-2 text-base font-semibold">维度成长对比</h2>
          <DimensionRadar data={radarData} second={prevRadar} />
        </section>
      )}
    </div>
  )
}

function MetricCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode
  label: string
  value: string
  accent: string
}) {
  return (
    <div className="glass group rounded-2xl p-5 transition-all duration-300 hover:border-primary/25">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className={cn('mt-2 text-2xl font-bold', accent)}>{value}</p>
    </div>
  )
}
