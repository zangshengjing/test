import { Check, Clock, Trash2 } from 'lucide-react'
import type { CheckIn, Task } from '../../../../shared/types'
import { cn } from '../../lib/utils'
import { CATEGORY_COLOR, CATEGORY_LABEL } from '../../lib/constants'

interface TaskItemProps {
  task: Task
  checkin?: CheckIn
  onToggle: (completed: boolean) => void
  onDelete?: () => void
}

export function TaskItem({ task, checkin, onToggle, onDelete }: TaskItemProps) {
  const done = !!checkin?.completed
  const color = CATEGORY_COLOR[task.category] ?? '#60A5FA'

  return (
    <div
      className={cn(
        'glass group flex items-center gap-3 rounded-xl px-3.5 py-3 transition-all duration-300',
        done && 'opacity-75'
      )}
    >
      <button
        onClick={() => onToggle(!done)}
        aria-label={done ? '取消打卡' : '完成打卡'}
        className={cn(
          'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300',
          done
            ? 'check-pop border-transparent bg-gradient-brand shadow-md shadow-amber-500/30'
            : 'border-border hover:border-primary/60 hover:bg-primary/10'
        )}
      >
        {done && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
      </button>

      <div className="min-w-0 flex-1">
        <p className={cn('truncate text-sm font-medium', done && 'text-muted-foreground line-through')}>
          {task.title}
        </p>
        <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {task.durationMin} 分钟
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
            {CATEGORY_LABEL[task.category]}
          </span>
          {task.source === 'manual' && <span className="rounded bg-black/10 px-1 py-px text-[10px]">手动</span>}
        </p>
      </div>

      {onDelete && (
        <button
          onClick={onDelete}
          className="rounded-lg p-1.5 text-muted-foreground/60 opacity-0 transition-all hover:bg-destructive/15 hover:text-destructive group-hover:opacity-100"
          aria-label="删除任务"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
