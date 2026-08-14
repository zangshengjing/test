import { useEffect, useRef, useState } from 'react'
import { Download, Plus, RefreshCcw, Save, Settings2, Target, Upload } from 'lucide-react'
import type { GoalTemplate, ProfileInput, TaskCategory } from '../../../shared/types'
import { api } from '../api/client'
import { useGoalStore } from '../store/useGoalStore'
import { useProfileStore } from '../store/useProfileStore'
import { GoalCard } from '../components/common/GoalCard'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Slider } from '../components/ui/slider'
import { toast } from '../components/common/toast'
import { cn } from '../lib/utils'
import { CATEGORY_LABEL } from '../lib/constants'

export default function GoalsPage() {
  const goals = useGoalStore((s) => s.goals)
  const fetchGoals = useGoalStore((s) => s.fetchGoals)
  const addGoal = useGoalStore((s) => s.addGoal)
  const updateGoal = useGoalStore((s) => s.updateGoal)
  const removeGoal = useGoalStore((s) => s.removeGoal)
  const profile = useProfileStore((s) => s.profile)
  const saveProfile = useProfileStore((s) => s.saveProfile)

  const [templates, setTemplates] = useState<GoalTemplate[]>([])
  const [newOpen, setNewOpen] = useState(false)
  const [selectedTpl, setSelectedTpl] = useState<string | null>(null)
  const [custom, setCustom] = useState({ title: '', category: 'study' as TaskCategory, description: '' })
  const [routine, setRoutine] = useState<ProfileInput | null>(null)
  const [savingRoutine, setSavingRoutine] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchGoals()
    api
      .get<{ library: { goalTemplates: GoalTemplate[] } }>('/seed/library')
      .then((res) => setTemplates(res.library.goalTemplates))
      .catch((e) => console.error('[goals] 模板加载失败', e))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (profile && !routine) {
      setRoutine({
        name: profile.name,
        wakeTime: profile.wakeTime,
        sleepTime: profile.sleepTime,
        workStart: profile.workStart,
        workEnd: profile.workEnd,
        commuteMin: profile.commuteMin,
        workDays: profile.workDays,
      })
    }
  }, [profile, routine])

  const createFromTemplate = async () => {
    const tpl = templates.find((t) => t.id === selectedTpl)
    if (!tpl) return
    await addGoal({
      title: tpl.title,
      description: tpl.description,
      category: tpl.category,
      templateId: tpl.id,
      targetDays: tpl.targetDays,
      weeklyDays: tpl.weeklyDays,
    })
    toast({ title: '目标已创建', description: '每日任务将自动生成', type: 'success' })
    setSelectedTpl(null)
    setNewOpen(false)
  }

  const createCustom = async () => {
    if (!custom.title.trim()) return
    await addGoal({
      title: custom.title.trim(),
      description: custom.description.trim(),
      category: custom.category,
    })
    toast({ title: '自定义目标已创建', type: 'success' })
    setCustom({ title: '', category: 'study', description: '' })
    setNewOpen(false)
  }

  const saveRoutine = async () => {
    if (!routine) return
    setSavingRoutine(true)
    try {
      await saveProfile(routine, true)
      toast({ title: '作息设置已保存', type: 'success' })
    } catch (e) {
      console.error('[goals] 保存作息失败', e)
    } finally {
      setSavingRoutine(false)
    }
  }

  // —— 数据管理 ——
  const exportData = async () => {
    try {
      const res = await api.get<{ exportedAt: string; data: unknown }>('/data/export')
      const blob = new Blob([JSON.stringify(res, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `growth-backup-${res.exportedAt.slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast({ title: '备份已导出', type: 'success' })
    } catch (e) {
      console.error('[goals] 导出失败', e)
    }
  }

  const importData = async (file: File) => {
    try {
      const text = await file.text()
      const json = JSON.parse(text)
      await api.post('/data/import', { data: json.data ?? json })
      toast({ title: '数据已恢复', type: 'success' })
      await Promise.all([fetchGoals(), useProfileStore.getState().fetchProfile()])
    } catch (e) {
      console.error('[goals] 导入失败', e)
      toast({ title: '导入失败', description: '文件格式不正确', type: 'warn' })
    }
  }

  const resetAll = async () => {
    if (!window.confirm('确定要重置所有数据吗？此操作不可恢复，建议先导出备份。')) return
    try {
      await api.post('/data/reset')
      toast({ title: '已重置所有数据', type: 'success' })
      await Promise.all([fetchGoals(), useProfileStore.getState().fetchProfile()])
    } catch (e) {
      console.error('[goals] 重置失败', e)
    }
  }

  return (
    <div className="space-y-5 animate-in fade-in-0 duration-500">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">目标与设置</h1>
          <p className="mt-1 text-sm text-muted-foreground">管理成长目标、作息与数据</p>
        </div>
        <Button onClick={() => setNewOpen(true)}>
          <Plus className="h-4 w-4" /> 新建目标
        </Button>
      </div>

      {/* 目标列表 */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {goals.map((g) => (
          <GoalCard
            key={g.id}
            goal={g}
            onToggleStatus={(status) => updateGoal(g.id, { status })}
            onDelete={() => {
              if (window.confirm(`删除目标「${g.title}」？关联任务与打卡将一并删除。`)) removeGoal(g.id)
            }}
          />
        ))}
        {goals.length === 0 && (
          <div className="glass col-span-full flex flex-col items-center gap-3 rounded-3xl p-10 text-center">
            <Target className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">还没有目标，创建一个开始你的成长计划</p>
          </div>
        )}
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* 作息设置 */}
        <section className="glass rounded-3xl p-5">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold">
            <Settings2 className="h-4 w-4 text-primary" /> 作息设置
          </h2>
          {routine ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>起床时间</Label>
                  <Input type="time" value={routine.wakeTime} onChange={(e) => setRoutine({ ...routine, wakeTime: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>睡觉时间</Label>
                  <Input type="time" value={routine.sleepTime} onChange={(e) => setRoutine({ ...routine, sleepTime: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>上班时间</Label>
                  <Input type="time" value={routine.workStart} onChange={(e) => setRoutine({ ...routine, workStart: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>下班时间</Label>
                  <Input type="time" value={routine.workEnd} onChange={(e) => setRoutine({ ...routine, workEnd: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>单程通勤：{routine.commuteMin} 分钟</Label>
                <Slider
                  min={5}
                  max={120}
                  step={5}
                  value={[routine.commuteMin]}
                  onValueChange={(v) => setRoutine({ ...routine, commuteMin: v[0] })}
                />
              </div>
              <Button onClick={saveRoutine} disabled={savingRoutine}>
                <Save className="h-4 w-4" /> {savingRoutine ? '保存中...' : '保存设置'}
              </Button>
            </div>
          ) : (
            <div className="skeleton h-40 rounded-xl" />
          )}
        </section>

        {/* 数据管理 */}
        <section className="glass rounded-3xl p-5">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold">
            <Download className="h-4 w-4 text-primary" /> 数据管理
          </h2>
          <p className="text-xs leading-relaxed text-muted-foreground">
            所有数据保存在本机 SQLite 数据库。支持导出 JSON 备份、导入恢复与一键重置。
          </p>
          <div className="mt-4 space-y-2.5">
            <Button variant="glass" className="w-full justify-start" onClick={exportData}>
              <Download className="h-4 w-4" /> 导出数据备份
            </Button>
            <Button variant="glass" className="w-full justify-start" onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4" /> 从备份导入
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) importData(f)
                e.target.value = ''
              }}
            />
            <Button variant="destructive" className="w-full justify-start" onClick={resetAll}>
              <RefreshCcw className="h-4 w-4" /> 重置全部数据
            </Button>
          </div>
        </section>
      </div>

      {/* 新建目标 */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>新建成长目标</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTpl(t.id)}
                  className={cn(
                    'rounded-xl border p-3 text-left transition-all',
                    selectedTpl === t.id
                      ? 'border-primary/50 bg-primary/10'
                      : 'border-black/15 bg-white/60 hover:bg-white/90'
                  )}
                >
                  <span className="text-xs font-semibold">{t.title}</span>
                  <span className="mt-0.5 block text-[11px] text-muted-foreground">{t.description}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-black/15" />
              <span className="text-[11px] text-muted-foreground">或自定义</span>
              <span className="h-px flex-1 bg-black/15" />
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>目标名称</Label>
                <Input
                  value={custom.title}
                  onChange={(e) => setCustom({ ...custom, title: e.target.value })}
                  placeholder="例如：每周陪家人散步 3 次"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>分类</Label>
                  <select
                    className="h-10 w-full rounded-xl border border-input bg-white/70 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/25"
                    value={custom.category}
                    onChange={(e) => setCustom({ ...custom, category: e.target.value as TaskCategory })}
                  >
                    {(Object.keys(CATEGORY_LABEL) as TaskCategory[]).map((c) => (
                      <option key={c} value={c}>
                        {CATEGORY_LABEL[c]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>说明（可选）</Label>
                  <Input
                    value={custom.description}
                    onChange={(e) => setCustom({ ...custom, description: e.target.value })}
                    placeholder="一句话描述"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setNewOpen(false)}>
              取消
            </Button>
            {selectedTpl ? (
              <Button onClick={createFromTemplate}>使用模板创建</Button>
            ) : (
              <Button onClick={createCustom} disabled={!custom.title.trim()}>
                创建目标
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
