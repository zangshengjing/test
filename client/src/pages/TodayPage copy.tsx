import { useEffect, useMemo, useState } from 'react'
import { Flame, Plus, Sparkles, TrendingUp } from 'lucide-react'
import { useTodayStore } from '../store/useTodayStore'
import { useProfileStore } from '../store/useProfileStore'
import { useTaskStore } from '../store/useTaskStore'
import { useScheduleStore } from '../store/useScheduleStore'
import { useCheckinStore } from '../store/useCheckinStore'
import { useContentStore } from '../store/useContentStore'
import { formatCN } from '../utils/date'
import { ProgressRing } from '../components/common/ProgressRing'
import { TaskItem } from '../components/common/TaskItem'
import { ContentViewer } from '../components/common/ContentViewer'
import { DayTimeline } from '../components/timeline/DayTimeline'
import { Button } from '../components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { CATEGORY_LABEL } from '../lib/constants'
import type { TaskCategory } from '../../../shared/types'
import { toast } from '../components/common/toast'

export default function TodayPage() {
  const today = useTodayStore((s) => s.today)
  const name = useProfileStore((s) => s.profile?.name)
  const tasks = useTaskStore((s) => s.tasks)
  const fetchTasks = useTaskStore((s) => s.fetchTasks)
  const addTask = useTaskStore((s) => s.addTask)
  const removeTask = useTaskStore((s) => s.removeTask)
  const blocks = useScheduleStore((s) => s.blocks)
  const fetchSchedule = useScheduleStore((s) => s.fetchSchedule)
  const patchBlock = useScheduleStore((s) => s.patchBlock)
  const checkins = useCheckinStore((s) => s.checkins)
  const fetchCheckins = useCheckinStore((s) => s.fetchCheckins)
  const toggle = useCheckinStore((s) => s.toggle)
  const todayContent = useContentStore((s) => s.todayContent)
  const fetchToday = useContentStore((s) => s.fetchToday)

  const [addOpen, setAddOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState<TaskCategory>('study')
  const [newDuration, setNewDuration] = useState(30)

  useEffect(() => {
    fetchTasks(today)
    fetchSchedule(today)
    fetchCheckins(today)
    fetchToday(today)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today])

  const doneCount = useMemo(
    () => tasks.filter((t) => checkins[t.id]?.completed).length,
    [tasks, checkins]
  )
  const rate = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0
  const hour = new Date().getHours()
  const greeting = hour < 6 ? '夜深了' : hour < 12 ? '早上好' : hour < 18 ? '下午好' : '晚上好'

  const submitAdd = async () => {
    if (!newTitle.trim()) return
    await addTask({ title: newTitle.trim(), category: newCategory, durationMin: newDuration, date: today })
    toast({ title: '已添加到今日计划', type: 'success' })
    setNewTitle('')
    setAddOpen(false)
  }

  return (
    <div className="space-y-5 animate-in fade-in-0 duration-500">
      {/* 顶部问候 */}
      <section className="glass relative overflow-hidden rounded-3xl p-6 md:p-8">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-500/12 via-transparent to-violet-500/12" />
        <div className="relative flex flex-wrap items-center gap-6">
          <div className="min-w-0 flex-1">
            <p className="text-sm text-muted-foreground">{formatCN(today)}</p>
            <h1 className="mt-1 text-2xl font-bold md:text-3xl">
              {greeting}，<span className="text-gradient">{name || '朋友'}</span>
            </h1>
            <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Flame className="h-4 w-4 text-coral" />
              今天完成 {doneCount}/{tasks.length} 项任务
              {tasks.length > 0 && doneCount === tasks.length && <span className="text-success">全部完成，太棒了！</span>}
            </p>
          </div>
          <ProgressRing value={rate} size={104} stroke={10} label="今日完成度" />
        </div>
      </section>

      {/* 今日学习内容 */}
      {todayContent && <ContentViewer content={todayContent} />}

      <div className="grid gap-5 lg:grid-cols-5">
        {/* 24 小时时间线 */}
        <section className="lg:col-span-3">
          <SectionHeader
            title="24 小时时间表"
            sub="点击任意时间块可编辑 · 学习健身任务已自动插入黄金时段"
          />
          <DayTimeline blocks={blocks} onPatch={patchBlock} />
        </section>

        {/* 今日任务 */}
        <section className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-base font-semibold">
                <Sparkles className="h-4 w-4 text-primary" /> 今日任务
              </h2>
              <p className="text-xs text-muted-foreground">按星期自动轮换 · 支持手动添加</p>
            </div>
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" /> 添加
            </Button>
          </div>

          <div className="space-y-2">
            {tasks.length === 0 && (
              <div className="glass flex flex-col items-center gap-3 rounded-2xl p-8 text-center">
                <TrendingUp className="h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  今天还没有任务，去「目标」页创建目标，或点击右上角手动添加
                </p>
              </div>
            )}
            {tasks.map((t) => (
              <TaskItem
                key={t.id}
                task={t}
                checkin={checkins[t.id]}
                onToggle={(completed) => {
                  toggle(today, t.id, completed)
                  if (completed) toast({ title: '打卡成功 ✨', type: 'success' })
                }}
                onDelete={() => removeTask(t.id)}
              />
            ))}
          </div>
        </section>
      </div>

      {/* 快捷添加任务 */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加今日任务</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>任务内容</Label>
              <Input
                placeholder="例如：完成 TypeScript 课程第 3 章"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label>分类</Label>
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(CATEGORY_LABEL) as TaskCategory[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => setNewCategory(c)}
                    className={`rounded-lg border px-2.5 py-1.5 text-xs transition-all ${
                      newCategory === c
                        ? 'border-primary/50 bg-primary/15 text-foreground'
                        : 'border-white/10 text-muted-foreground hover:bg-white/5'
                    }`}
                  >
                    {CATEGORY_LABEL[c]}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>预计时长：{newDuration} 分钟</Label>
              <Input
                type="range"
                min={5}
                max={120}
                step={5}
                value={newDuration}
                onChange={(e) => setNewDuration(Number(e.target.value))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>
              取消
            </Button>
            <Button onClick={submitAdd} disabled={!newTitle.trim()}>
              添加到今日
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-3">
      <h2 className="text-base font-semibold">{title}</h2>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  )
}
