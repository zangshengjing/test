import { useState } from 'react'
import { BookOpen, Clock, ExternalLink, PlayCircle } from 'lucide-react'
import type { LearningContent } from '../../../../shared/types'
import { cn } from '../../lib/utils'
import { CONTENT_CATEGORY_LABEL } from '../../lib/constants'

/** 今日学习内容：文字阅读 / 视频跳转 */
export function ContentViewer({ content }: { content: LearningContent }) {
  const [reading, setReading] = useState(false)
  const isVideo = content.type === 'video'

  return (
    <div className="glass overflow-hidden rounded-2xl">
      {/* 头部 */}
      <div className="relative flex items-center gap-4 p-5">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-500/12 via-transparent to-coral-500/10" />
        <div
          className={cn(
            'relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-lg',
            isVideo ? 'bg-accent/20 text-accent' : 'bg-success/20 text-success'
          )}
        >
          {isVideo ? <PlayCircle className="h-6 w-6" /> : <BookOpen className="h-6 w-6" />}
        </div>
        <div className="relative min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">今日学习内容</p>
          <h3 className="mt-0.5 truncate text-base font-semibold">{content.title}</h3>
          <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <span>{CONTENT_CATEGORY_LABEL[content.category]}</span>
            <span className="flex items-center gap-0.5">
              <Clock className="h-3 w-3" /> {content.durationMin} 分钟
            </span>
            <span className={cn('rounded-md px-1.5 py-0.5 text-[10px]', isVideo ? 'bg-accent/15 text-accent' : 'bg-success/15 text-success')}>
              {isVideo ? '视频' : '文字'}
            </span>
          </p>
        </div>
      </div>

      {/* 正文 / 视频 */}
      {!isVideo ? (
        reading ? (
          <div className="max-h-[46vh] overflow-y-auto px-6 pb-6">
            <article
              className="whitespace-pre-wrap text-[14px] leading-[1.9] text-foreground/90"
              style={{ maxWidth: '68ch' }}
            >
              {content.textBody}
            </article>
            <button onClick={() => setReading(false)} className="mt-4 text-xs text-muted-foreground hover:text-foreground">
              ← 收起
            </button>
          </div>
        ) : (
          <div className="px-5 pb-5">
            <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{content.summary}</p>
            <button
              onClick={() => setReading(true)}
              className="mt-3 flex items-center gap-2 rounded-xl bg-gradient-brand px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              <BookOpen className="h-4 w-4" /> 开始阅读
            </button>
          </div>
        )
      ) : (
        <div className="px-5 pb-5">
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{content.summary}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {content.embedUrl ? (
              <a
                href={content.embedUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-xl bg-accent/90 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                <PlayCircle className="h-4 w-4" /> 在线播放
              </a>
            ) : (
              <a
                href={content.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-xl bg-accent/90 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                <ExternalLink className="h-4 w-4" /> 跳转观看
              </a>
            )}
            <span className="text-[11px] text-muted-foreground">建议配合番茄钟专注完成</span>
          </div>
        </div>
      )}
    </div>
  )
}
