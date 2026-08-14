import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, BookOpen, CalendarRange, Eye, Flame, PlayCircle, Sparkles } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import type { LearningContent, TaskCategory } from '../../../shared/types'
import { api } from '../api/client'
import { useGoalStore } from '../store/useGoalStore'
import { useTaskStore } from '../store/useTaskStore'
import { useTodayStore } from '../store/useTodayStore'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog'
import { ContentCard } from '../components/common/ContentCard'
import { CATEGORY_COLOR, CATEGORY_LABEL, CONTENT_CATEGORY_LABEL, GOAL_STATUS_LABEL } from '../lib/constants'
import { toast } from '../components/common/toast'
import { cn } from '../lib/utils'
import { formatCN } from '../utils/date'

function formatViews(v?: number): string {
  if (!v || v <= 0) return '0'
  if (v >= 10000) return `${(v / 10000).toFixed(1)}w`
  return String(v)
}

export default function GoalDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const goals = useGoalStore((s) => s.goals)
  const fetchGoals = useGoalStore((s) => s.fetchGoals)
  const addTask = useTaskStore((s) => s.addTask)
  const tasks = useTaskStore((s) => s.tasks)
  const today = useTodayStore((s) => s.today)

  const [contents, setContents] = useState<LearningContent[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<LearningContent | null>(null)

  const goal = useMemo(() => goals.find((g) => g.id === id), [goals, id])
  const color = CATEGORY_COLOR[goal?.category ?? ''] ?? '#60A5FA'

  const addedContentIds = useMemo(
    () => new Set(tasks.filter((t) => t.contentId).map((t) => t.contentId)),
    [tasks]
  )

  useEffect(() => {
    if (goals.length === 0) fetchGoals()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    api
      .get<{ contents: LearningContent[] }>(`/goals/${id}/recommend`)
      .then((res) => setContents(res.contents))
      .catch((e) => console.error('[goal detail] 推荐内容加载失败', e))
      .finally(() => setLoading(false))
  }, [id])

  const joinToday = async (c: LearningContent) => {
    await addTask({
      title: `学习：${c.title}`,
      category: (c.category as TaskCategory) ?? goal?.category ?? 'study',
      contentId: c.id,
      durationMin: c.durationMin,
      date: today,
    })
    toast({ title: '已加入今日计划', description: c.title, type: 'success' })
  }

  return (
    <div className="space-y-5 animate-in fade-in-0 duration-500">
      <button
        onClick={() => navigate('/goals')}
        className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> 返回目标列表
      </button>

      {goal && (
        <div className="glass relative overflow-hidden rounded-2xl p-5">
          <div
            className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-20 blur-3xl"
            style={{ background: color }}
          />
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: color }} />
                <h1 className="text-xl font-bold">{goal.title}</h1>
                <Badge variant={goal.status === 'active' ? 'success' : goal.status === 'paused' ? 'warn' : 'secondary'}>
                  {GOAL_STATUS_LABEL[goal.status]}
                </Badge>
              </div>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {goal.description || CATEGORY_LABEL[goal.category]}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-lg bg-black/5 px-2.5 py-1 text-xs font-medium">{CATEGORY_LABEL[goal.category]}</span>
              <span className="flex items-center gap-1 rounded-lg bg-black/5 px-2.5 py-1 text-xs text-muted-foreground">
                <Flame className="h-3 w-3 text-primary" /> {goal.targetDays} 天目标
              </span>
              <span className="flex items-center gap-1 rounded-lg bg-black/5 px-2.5 py-1 text-xs text-muted-foreground">
                <CalendarRange className="h-3 w-3" /> {formatCN(goal.createdAt.slice(0, 10))} 开始
              </span>
            </div>
          </div>
          <div className="mt-5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>目标进度</span>
              <span className="font-medium text-foreground">
                {goal.progress?.done ?? 0}/{goal.progress?.total ?? 0} 次打卡 · {goal.progress?.rate ?? 0}%
              </span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-black/10">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${goal.progress?.rate ?? 0}%`, background: `linear-gradient(90deg, ${color}, #FB7185)` }}
              />
            </div>
          </div>
        </div>
      )}

      <div>
        <div className="mb-3 flex items-center gap-2">
          <div className="bg-gradient-brand flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-sm">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">匹配推荐</h2>
            <p className="text-xs text-muted-foreground">与该目标方向一致的最新 · 高浏览量内容，任你挑选</p>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="glass h-40 rounded-2xl" />
            ))}
          </div>
        ) : contents.length === 0 ? (
          <div className="glass flex flex-col items-center gap-3 rounded-2xl p-10 text-center">
            <BookOpen className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">暂无匹配内容，可前往学习库挑选</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {contents.map((c) => (
              <div key={c.id} className="relative">
                <ContentCard content={c} onClick={() => setSelected(c)} onAdd={() => joinToday(c)} added={addedContentIds.has(c.id)} />
                <span className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  <Eye className="h-3 w-3" /> {formatViews(c.views)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 内容详情弹窗 */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent>
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="pr-8">{selected.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className={cn('rounded-md px-1.5 py-0.5 text-[10px] font-medium', selected.type === 'video' ? 'bg-accent/15 text-accent' : 'bg-success/15 text-success')}>
                    {selected.type === 'video' ? '视频' : '文字'}
                  </span>
                  <span>{CONTENT_CATEGORY_LABEL[selected.category] ?? selected.category}</span>
                  <span>{selected.durationMin} 分钟</span>
                  {selected.views != null && (
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" /> {formatViews(selected.views)} 次浏览
                    </span>
                  )}
                  {selected.publishedAt && <span>发布于 {formatCN(selected.publishedAt)}</span>}
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{selected.summary}</p>
                {selected.type === 'text' ? (
                  <div className="space-y-3">
                    <div className="max-h-[50vh] overflow-y-auto rounded-xl bg-black/[0.04] p-4 text-sm leading-relaxed whitespace-pre-wrap">
                      {selected.textBody || '暂无正文'}
                    </div>
                    {selected.link && (
                      <a
                        href={selected.link}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 rounded-xl bg-success/90 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                      >
                        <BookOpen className="h-4 w-4" /> 前往在线阅读
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selected.embedUrl && (
                      <div className="aspect-video overflow-hidden rounded-xl">
                        <iframe
                          src={selected.embedUrl}
                          title={selected.title}
                          className="h-full w-full"
                          allowFullScreen
                          loading="lazy"
                        />
                      </div>
                    )}
                    {selected.videoUrl && (
                      <a
                        href={selected.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 rounded-xl bg-accent/15 py-2.5 text-sm font-medium text-accent transition-colors hover:bg-accent/25"
                      >
                        <PlayCircle className="h-4 w-4" /> 前往观看
                      </a>
                    )}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setSelected(null)}>
                  关闭
                </Button>
                <Button
                  onClick={() => {
                    joinToday(selected)
                    setSelected(null)
                  }}
                  disabled={addedContentIds.has(selected.id)}
                >
                  {addedContentIds.has(selected.id) ? '已加入今日' : '加入今日计划'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
