import { Pause, Play, CheckCircle2, Trash2, CalendarRange, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { GoalWithProgress } from '../../store/useGoalStore'
import { Badge } from '../ui/badge'
import { CATEGORY_COLOR, CATEGORY_LABEL, GOAL_STATUS_LABEL } from '../../lib/constants'

interface GoalCardProps {
  goal: GoalWithProgress
  onToggleStatus: (status: 'active' | 'paused' | 'done') => void
  onDelete: () => void
}

export function GoalCard({ goal, onToggleStatus, onDelete }: GoalCardProps) {
  const navigate = useNavigate()
  const rate = goal.progress?.rate ?? 0
  const color = CATEGORY_COLOR[goal.category] ?? '#60A5FA'

  const openDetail = () => navigate(`/goals/${goal.id}`)

  return (
    <div
      onClick={openDetail}
      className="glass group cursor-pointer rounded-2xl p-4 transition-all duration-300 hover:border-primary/25 hover:bg-white/90"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: color }} />
            <h4 className="truncate text-sm font-semibold group-hover:text-primary">{goal.title}</h4>
          </div>
          <p className="mt-1 line-clamp-2 pl-4.5 text-xs leading-relaxed text-muted-foreground">
            {goal.description || CATEGORY_LABEL[goal.category]}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Badge variant={goal.status === 'active' ? 'success' : goal.status === 'paused' ? 'warn' : 'secondary'}>
            {GOAL_STATUS_LABEL[goal.status]}
          </Badge>
          <ChevronRight className="h-4 w-4 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
        </div>
      </div>

      <div className="mt-3.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CalendarRange className="h-3 w-3" />
            进度 · {goal.progress?.done ?? 0}/{goal.progress?.total ?? 0} 次打卡
          </span>
          <span className="font-medium text-foreground">{rate}%</span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-black/10">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${rate}%`, background: `linear-gradient(90deg, ${color}, #FB7185)` }}
          />
        </div>
      </div>

      <div className="mt-3.5 flex items-center gap-2 border-t border-black/10 pt-3">
        {goal.status === 'active' ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleStatus('paused')
            }}
            className="flex items-center gap-1 rounded-lg bg-black/5 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-black/10 hover:text-foreground"
          >
            <Pause className="h-3 w-3" /> 暂停
          </button>
        ) : goal.status === 'paused' ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleStatus('active')
            }}
            className="flex items-center gap-1 rounded-lg bg-success/15 px-2.5 py-1.5 text-xs text-success transition-colors hover:bg-success/25"
          >
            <Play className="h-3 w-3" /> 继续
          </button>
        ) : null}
        {goal.status !== 'done' && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleStatus('done')
            }}
            className="flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1.5 text-xs text-primary transition-colors hover:bg-primary/20"
          >
            <CheckCircle2 className="h-3 w-3" /> 完成
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="ml-auto rounded-lg p-1.5 text-muted-foreground/60 opacity-0 transition-all hover:bg-destructive/15 hover:text-destructive group-hover:opacity-100"
          aria-label="删除目标"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
