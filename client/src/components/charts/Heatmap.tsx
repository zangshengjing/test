import { useMemo } from 'react'
import { cn } from '../../lib/utils'

const LEVELS = [
  { max: 0, cls: 'bg-black/[0.06]' },
  { max: 2, cls: 'bg-emerald-500/25' },
  { max: 4, cls: 'bg-emerald-500/50' },
  { max: 7, cls: 'bg-amber-500/60' },
  { max: Infinity, cls: 'bg-gradient-brand' },
]

/** 打卡日历热力图（近 N 天） */
export function Heatmap({ data }: { data: { date: string; count: number }[] }) {
  const rows = useMemo(() => {
    // 按周列分组：从最早一天（周一）开始
    const weeks: { date: string; count: number }[][] = []
    let week: { date: string; count: number }[] = []
    const firstDow = new Date(`${data[0]?.date}T00:00:00`).getDay() // 0=周日
    // 补齐开头的空位（把首周移动到以周日开头）
    const pad = (firstDow + 1) % 7
    for (let i = 0; i < pad && i < data.length; i++) week.push({ date: '', count: -1 })
    for (const d of data) {
      week.push(d)
      if (week.length === 7) {
        weeks.push(week)
        week = []
      }
    }
    if (week.length) {
      while (week.length < 7) week.push({ date: '', count: -1 })
      weeks.push(week)
    }
    return weeks
  }, [data])

  const maxCount = useMemo(() => Math.max(1, ...data.map((d) => d.count)), [data])

  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1">
      {rows.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-1.5">
          {week.map((d, di) => {
            const cell = (() => {
              if (d.count < 0) return { cls: 'bg-transparent', title: '' }
              const lv = LEVELS.find((l) => d.count <= l.max) ?? LEVELS[LEVELS.length - 1]
              return { cls: lv.cls, title: `${d.date} · ${d.count} 次打卡` }
            })()
            return (
              <div
                key={di}
                title={cell.title}
                className={cn('h-3.5 w-3.5 rounded-[4px] transition-transform hover:scale-125', cell.cls)}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}
