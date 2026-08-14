import { BookOpen, Clock, ExternalLink, FileText, Plus, Video } from 'lucide-react'
import type { LearningContent } from '../../../../shared/types'
import { cn } from '../../lib/utils'
import { CONTENT_CATEGORY_LABEL } from '../../lib/constants'

interface ContentCardProps {
  content: LearningContent
  onAdd?: () => void
  onClick?: () => void
  added?: boolean
}

export function ContentCard({ content, onAdd, onClick, added }: ContentCardProps) {
  const isVideo = content.type === 'video'
  return (
    <div
      onClick={onClick}
      className={cn(
        'glass group cursor-pointer rounded-2xl p-4 transition-all duration-300 hover:border-primary/30 hover:bg-white/90',
        onClick && 'cursor-pointer',
        !onClick && 'cursor-default'
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
            isVideo ? 'bg-accent/15 text-accent' : 'bg-success/15 text-success'
          )}
        >
          {isVideo ? <Video className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="truncate text-sm font-semibold">{content.title}</h4>
            <span
              className={cn(
                'shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-medium',
                isVideo ? 'bg-accent/15 text-accent' : 'bg-success/15 text-success'
              )}
            >
              {isVideo ? '视频' : '文字'}
            </span>
          </div>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{content.summary}</p>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
            <span>{CONTENT_CATEGORY_LABEL[content.category]}</span>
            <span className="flex items-center gap-0.5">
              <Clock className="h-3 w-3" />
              {content.durationMin} 分钟
            </span>
            {content.origin === 'custom' && <span className="rounded bg-black/10 px-1 py-px">自定义</span>}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-black/10 pt-3">
        {isVideo ? (
          <span className="flex items-center gap-1 text-xs text-accent">
            <ExternalLink className="h-3 w-3" /> 观看
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs text-success">
            <FileText className="h-3 w-3" /> 阅读
          </span>
        )}
        {onAdd && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onAdd()
            }}
            disabled={added}
            className={cn(
              'flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-all',
              added
                ? 'cursor-not-allowed bg-black/5 text-muted-foreground'
                : 'bg-gradient-brand text-white shadow-sm hover:opacity-90'
            )}
          >
            <Plus className="h-3 w-3" />
            {added ? '已加入' : '加入今日'}
          </button>
        )}
      </div>
    </div>
  )
}
