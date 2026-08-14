import type { DimensionScore } from '../../../../shared/types'
import { ProgressRing } from './ProgressRing'
import { cn } from '../../lib/utils'

const LEVEL_STYLE: Record<DimensionScore['level'], { label: string; cls: string }> = {
  excellent: { label: '优秀', cls: 'text-success' },
  good: { label: '良好', cls: 'text-info' },
  warning: { label: '关注', cls: 'text-warn' },
  danger: { label: '待改善', cls: 'text-destructive' },
}

export function DimensionCard({ score }: { score: DimensionScore }) {
  const lv = LEVEL_STYLE[score.level]
  return (
    <div className="glass flex items-center gap-4 rounded-2xl p-4 transition-all duration-300 hover:border-primary/25 hover:bg-white/90">
      <ProgressRing value={score.score} size={64} stroke={6} showPercent={false}>
        <span className="text-base font-bold leading-none">{score.score}</span>
      </ProgressRing>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold">{score.label}</h4>
          <span className={cn('rounded-md bg-black/5 px-1.5 py-0.5 text-[10px] font-medium', lv.cls)}>{lv.label}</span>
        </div>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{score.advice}</p>
      </div>
    </div>
  )
}
