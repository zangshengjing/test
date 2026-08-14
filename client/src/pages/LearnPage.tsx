import { useEffect, useMemo, useState } from 'react'
import { BookOpen, Eye, FilePlus2, PlayCircle, Plus, Route } from 'lucide-react'
import type {
  ContentCategory,
  ContentType,
  LearningContent,
  LearningContentInput,
  SkillPath,
  TaskCategory,
} from '../../../shared/types'
import { api } from '../api/client'
import { useContentStore } from '../store/useContentStore'
import { useTaskStore } from '../store/useTaskStore'
import { useTodayStore } from '../store/useTodayStore'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { ContentCard } from '../components/common/ContentCard'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Badge } from '../components/ui/badge'
import { CONTENT_CATEGORY_LABEL } from '../lib/constants'
import { toast } from '../components/common/toast'
import { cn } from '../lib/utils'
import { formatCN } from '../utils/date'

const formatViews = (n?: number) =>
  n == null ? '' : n >= 10000 ? `${(n / 10000).toFixed(1)}w` : String(n)

export default function LearnPage() {
  const [books, setBooks] = useState<LearningContent[]>([])
  const [courses, setCourses] = useState<LearningContent[]>([])
  const [skillPaths, setSkillPaths] = useState<SkillPath[]>([])
  const library = useContentStore((s) => s.library)
  const fetchLibrary = useContentStore((s) => s.fetchLibrary)
  const addContent = useContentStore((s) => s.addContent)
  const addTask = useTaskStore((s) => s.addTask)
  const today = useTodayStore((s) => s.today)

  const [addOpen, setAddOpen] = useState(false)
  const [selected, setSelected] = useState<LearningContent | null>(null)
  const [form, setForm] = useState<LearningContentInput & { summary: string }>({
    type: 'text',
    title: '',
    category: 'study',
    summary: '',
    durationMin: 20,
    textBody: '',
    videoUrl: '',
  })

  useEffect(() => {
    api
      .get<{ library: { books: LearningContent[]; courses: LearningContent[]; skillPaths: SkillPath[] } }>(
        '/seed/library'
      )
      .then((res) => {
        setBooks(res.library.books)
        setCourses(res.library.courses)
        setSkillPaths(res.library.skillPaths)
      })
      .catch((e) => console.error('[learn] 加载失败', e))
    fetchLibrary()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const dayTasks = useTaskStore((s) => s.tasks)
  const addedContentIds = useMemo(
    () => new Set(dayTasks.filter((t) => t.contentId).map((t) => t.contentId)),
    [dayTasks]
  )

  const joinToday = async (c: LearningContent) => {
    const cat = c.category as TaskCategory
    await addTask({
      title: `学习：${c.title}`,
      category: cat,
      contentId: c.id,
      durationMin: c.durationMin,
      date: today,
    })
    toast({ title: '已加入今日计划', description: c.title, type: 'success' })
  }

  const submitCustom = async () => {
    if (!form.title.trim()) return
    await addContent({
      type: form.type,
      title: form.title.trim(),
      category: form.category,
      summary: form.summary,
      durationMin: form.durationMin,
      textBody: form.type === 'text' ? form.textBody : undefined,
      videoUrl: form.type === 'video' ? form.videoUrl : undefined,
    })
    toast({ title: '已添加到学习库', type: 'success' })
    setForm({ type: 'text', title: '', category: 'study', summary: '', durationMin: 20, textBody: '', videoUrl: '' })
    setAddOpen(false)
  }

  return (
    <div className="space-y-5 animate-in fade-in-0 duration-500">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">学习库</h1>
          <p className="mt-1 text-sm text-muted-foreground">精选书单 · 课程 · 成长路径，一键加入今日计划</p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <FilePlus2 className="h-4 w-4" /> 添加内容
        </Button>
      </div>

      <Tabs defaultValue="books">
        <TabsList className="w-full justify-start overflow-x-auto sm:w-auto">
          <TabsTrigger value="books">📚 书单</TabsTrigger>
          <TabsTrigger value="courses">🎬 课程</TabsTrigger>
          <TabsTrigger value="paths">🧭 技能路径</TabsTrigger>
          <TabsTrigger value="library">🗂 内容库</TabsTrigger>
        </TabsList>

        <TabsContent value="books" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((b) => (
            <ContentCard key={b.id} content={b} onClick={() => setSelected(b)} onAdd={() => joinToday(b)} added={addedContentIds.has(b.id)} />
          ))}
        </TabsContent>

        <TabsContent value="courses" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <ContentCard key={c.id} content={c} onClick={() => setSelected(c)} onAdd={() => joinToday(c)} added={addedContentIds.has(c.id)} />
          ))}
        </TabsContent>

        <TabsContent value="paths">
          <div className="grid gap-4 lg:grid-cols-2">
            {skillPaths.map((p) => (
              <div key={p.id} className="glass rounded-2xl p-5">
                <div className="flex items-center gap-3">
                  <div className="bg-accent/15 flex h-10 w-10 items-center justify-center rounded-xl text-accent">
                    <Route className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{p.title}</h3>
                    <p className="text-xs text-muted-foreground">{p.description}</p>
                  </div>
                </div>
                <div className="mt-4 space-y-0">
                  {p.stages.map((stage, i) => (
                    <div key={i} className="relative pl-6 pb-5 last:pb-0">
                      {i < p.stages.length - 1 && (
                        <span className="absolute left-[7px] top-4 h-full w-px bg-black/15" />
                      )}
                      <span className="bg-gradient-brand absolute left-0 top-1 h-4 w-4 rounded-full ring-4 ring-white/70" />
                      <h4 className="text-xs font-semibold text-primary">{stage.name}</h4>
                      <ul className="mt-1.5 space-y-1">
                        {stage.items.map((item, j) => (
                          <li key={j} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <BookOpen className="h-3 w-3 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="library" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {library.map((c) => (
            <ContentCard key={c.id} content={c} onClick={() => setSelected(c)} onAdd={() => joinToday(c)} added={addedContentIds.has(c.id)} />
          ))}
          {library.length === 0 && (
            <div className="glass col-span-full flex flex-col items-center gap-3 rounded-2xl p-10 text-center">
              <PlayCircle className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">内容库为空，点击右上角添加你的第一条内容</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* 自定义添加 */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加学习内容</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              {(['text', 'video'] as ContentType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setForm({ ...form, type: t })}
                  className={cn(
                    'flex-1 rounded-xl border py-2 text-sm font-medium transition-all',
                    form.type === t
                      ? 'border-primary/50 bg-primary/15 text-foreground'
                      : 'border-black/15 text-muted-foreground hover:bg-white/80'
                  )}
                >
                  {t === 'text' ? '📄 文字内容' : '🎬 视频内容'}
                </button>
              ))}
            </div>
            <div className="space-y-1.5">
              <Label>标题</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="例如：React 状态管理精讲" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>分类</Label>
                <select
                  className="h-10 w-full rounded-xl border border-input bg-white/70 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/25"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as ContentCategory })}
                >
                  {(Object.keys(CONTENT_CATEGORY_LABEL) as ContentCategory[]).map((c) => (
                    <option key={c} value={c}>
                      {CONTENT_CATEGORY_LABEL[c]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>时长（分钟）</Label>
                <Input
                  type="number"
                  min={5}
                  max={240}
                  value={form.durationMin}
                  onChange={(e) => setForm({ ...form, durationMin: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>简介</Label>
              <Textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
            </div>
            {form.type === 'text' ? (
              <div className="space-y-1.5">
                <Label>正文</Label>
                <Textarea
                  className="min-h-[120px]"
                  value={form.textBody}
                  onChange={(e) => setForm({ ...form, textBody: e.target.value })}
                  placeholder="输入正文内容，支持多行..."
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label>视频链接</Label>
                <Input
                  value={form.videoUrl}
                  onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>
              取消
            </Button>
            <Button onClick={submitCustom} disabled={!form.title.trim() || (form.type === 'video' && !form.videoUrl?.trim())}>
              <Plus className="h-4 w-4" /> 保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 内容详情 */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent>
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="pr-8">{selected.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span
                    className={cn(
                      'rounded-md px-1.5 py-0.5 text-[10px] font-medium',
                      selected.type === 'video' ? 'bg-accent/15 text-accent' : 'bg-success/15 text-success'
                    )}
                  >
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
                    <div className="max-h-[50vh] overflow-y-auto rounded-xl bg-black/[0.04] p-4 text-sm leading-[1.9] text-foreground/90 whitespace-pre-wrap">
                      {selected.textBody || '暂无正文内容'}
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
                      <div className="aspect-video overflow-hidden rounded-xl bg-black">
                        <iframe
                          src={selected.embedUrl}
                          title={selected.title}
                          className="h-full w-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
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
                        className="flex items-center justify-center gap-2 rounded-xl bg-accent/90 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
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
