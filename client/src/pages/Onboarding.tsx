import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Sparkles, Rocket } from 'lucide-react'
import type {
  AssessmentQuestion,
  DimensionId,
  DimensionMeta,
  GoalTemplate,
  ProfileInput,
} from '../../../shared/types'
import { api } from '../api/client'
import { useProfileStore } from '../store/useProfileStore'
import { useGoalStore } from '../store/useGoalStore'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Slider } from '../components/ui/slider'
import { cn } from '../lib/utils'
import { toast } from '../components/common/toast'
import { DIMENSION_COLORS } from '../lib/constants'

interface SeedPayload {
  questions: AssessmentQuestion[]
  goalTemplates: GoalTemplate[]
  dimensions: DimensionMeta[]
}

const TOTAL_STEPS = 4

export default function Onboarding() {
  const [seed, setSeed] = useState<SeedPayload | null>(null)
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState<ProfileInput>({
    name: '',
    wakeTime: '06:30',
    sleepTime: '23:00',
    workStart: '09:00',
    workEnd: '18:30',
    commuteMin: 30,
    workDays: [1, 2, 3, 4, 5],
  })
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([])
  const [answers, setAnswers] = useState<Record<string, number[]>>({})

  const fetchProfile = useProfileStore((s) => s.fetchProfile)
  const saveProfile = useProfileStore((s) => s.saveProfile)
  const addGoal = useGoalStore((s) => s.addGoal)

  useEffect(() => {
    api
      .get<{ library: SeedPayload }>('/seed/library')
      .then((res) => setSeed(res.library))
      .catch((e) => console.error('[onboarding] 加载题库失败', e))
  }, [])

  const questionsByDim = useMemo(() => {
    const map = new Map<DimensionId, AssessmentQuestion[]>()
    for (const q of seed?.questions ?? []) {
      const list = map.get(q.dimension) ?? []
      list.push(q)
      map.set(q.dimension, list)
    }
    return map
  }, [seed])

  const canNext = useMemo(() => {
    if (step === 1) return !!form.name.trim() && !!form.wakeTime && !!form.sleepTime && !!form.workStart
    if (step === 2) return selectedTemplates.length > 0
    if (step === 3) {
      // 至少完整作答 3 个维度
      const doneDims = [...questionsByDim.entries()].filter(([dim, qs]) => {
        const list = answers[dim] ?? []
        return list.length >= qs.length && list.every((v) => v > 0)
      }).length
      return doneDims >= 3
    }
    return true
  }, [step, form, selectedTemplates, answers, questionsByDim])

  const chooseAnswer = (q: AssessmentQuestion, score: number) => {
    setAnswers((prev) => {
      const list = prev[q.dimension] ?? []
      // 该维度题目索引
      const dimQs = questionsByDim.get(q.dimension) ?? []
      const idx = dimQs.findIndex((x) => x.id === q.id)
      const next = [...list]
      while (next.length < dimQs.length) next.push(0)
      next[idx] = score
      return { ...prev, [q.dimension]: next }
    })
  }

  const finish = async () => {
    setSaving(true)
    try {
      await saveProfile(form, true)
      for (const tid of selectedTemplates) {
        const tpl = seed?.goalTemplates.find((t) => t.id === tid)
        if (!tpl) continue
        await addGoal({
          title: tpl.title,
          description: tpl.description,
          category: tpl.category,
          templateId: tpl.id,
          targetDays: tpl.targetDays,
          weeklyDays: tpl.weeklyDays,
        })
      }
      await api.post('/assessments', { answers })
      await fetchProfile()
      toast({ title: '欢迎加入成长星球 🎉', description: '你的个人档案与成长计划已生成', type: 'success' })
    } catch (e) {
      console.error('[onboarding] 初始化失败', e)
      toast({ title: '初始化失败', description: '请检查后端服务后重试', type: 'warn' })
      setSaving(false)
    }
  }

  if (!seed) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="skeleton h-8 w-40 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl">
        {/* 步骤条 */}
        <div className="mb-8 flex items-center gap-2">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div
              key={i}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-all duration-500',
                i <= step ? 'bg-gradient-brand' : 'bg-black/10'
              )}
            />
          ))}
        </div>

        <div className="glass-strong rounded-3xl p-6 md:p-8">
          {step === 0 && <WelcomeStep onNext={() => setStep(1)} />}

          {step === 1 && (
            <RoutineStep
              form={form}
              setForm={setForm}
              onBack={() => setStep(0)}
              onNext={() => setStep(2)}
            />
          )}

          {step === 2 && (
            <GoalStep
              templates={seed.goalTemplates}
              selected={selectedTemplates}
              setSelected={setSelectedTemplates}
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
            />
          )}

          {step === 3 && (
            <AssessStep
              dims={seed.dimensions}
              questions={questionsByDim}
              answers={answers}
              onAnswer={chooseAnswer}
              onBack={() => setStep(2)}
              onFinish={finish}
              saving={saving}
            />
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          第 {step + 1} 步 / 共 {TOTAL_STEPS} 步 · 每天进步一点点
        </p>
      </div>
    </div>
  )
}

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col items-center py-6 text-center">
      <div className="bg-gradient-brand flex h-16 w-16 items-center justify-center rounded-3xl shadow-glow">
        <Sparkles className="h-8 w-8 text-white" />
      </div>
      <h1 className="mt-5 text-2xl font-bold">
        欢迎来到 <span className="text-gradient">成长星球</span>
      </h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
        即将步入婚姻与家庭，是时候为身体、财务、技能与心态做一次系统升级。
        让我们用 4 步完成你的个人成长档案。
      </p>
      <Button size="lg" className="mt-8" onClick={onNext}>
        开始初始化 <Rocket className="h-4 w-4" />
      </Button>
    </div>
  )
}

function StepNav({ onBack, onNext, nextLabel = '下一步' }: { onBack: () => void; onNext: () => void; nextLabel?: string }) {
  return (
    <div className="mt-6 flex items-center justify-between">
      <Button variant="ghost" onClick={onBack}>
        <ChevronLeft className="h-4 w-4" /> 上一步
      </Button>
      <Button onClick={onNext}>
        {nextLabel} <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

function RoutineStep({
  form,
  setForm,
  onBack,
  onNext,
}: {
  form: ProfileInput
  setForm: React.Dispatch<React.SetStateAction<ProfileInput>>
  onBack: () => void
  onNext: () => void
}) {
  const toggleDay = (d: number) => {
    setForm((f) => ({
      ...f,
      workDays: f.workDays.includes(d) ? f.workDays.filter((x) => x !== d) : [...f.workDays, d],
    }))
  }
  return (
    <div>
      <h2 className="text-xl font-semibold">作息与个人信息</h2>
      <p className="mt-1 text-sm text-muted-foreground">时间表将依据你的作息自动生成</p>

      <div className="mt-5 space-y-4">
        <div className="space-y-1.5">
          <Label>怎么称呼你？</Label>
          <Input placeholder="例如：小明" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>起床时间</Label>
            <Input type="time" value={form.wakeTime} onChange={(e) => setForm({ ...form, wakeTime: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>睡觉时间</Label>
            <Input type="time" value={form.sleepTime} onChange={(e) => setForm({ ...form, sleepTime: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>上班时间</Label>
            <Input type="time" value={form.workStart} onChange={(e) => setForm({ ...form, workStart: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>下班时间</Label>
            <Input type="time" value={form.workEnd} onChange={(e) => setForm({ ...form, workEnd: e.target.value })} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>单程通勤时长：{form.commuteMin} 分钟</Label>
          <Slider
            min={5}
            max={120}
            step={5}
            value={[form.commuteMin]}
            onValueChange={(v) => setForm({ ...form, commuteMin: v[0] })}
          />
        </div>

        <div className="space-y-2">
          <Label>工作日（可多选）</Label>
          <div className="flex gap-1.5">
            {['日', '一', '二', '三', '四', '五', '六'].map((label, i) => (
              <button
                key={i}
                type="button"
                onClick={() => toggleDay(i)}
                className={cn(
                  'flex-1 rounded-lg border py-2 text-xs font-medium transition-all',
                  form.workDays.includes(i)
                    ? 'border-primary/50 bg-primary/15 text-primary'
                    : 'border-border text-muted-foreground hover:bg-black/5'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <StepNav onBack={onBack} onNext={onNext} nextLabel="选择目标" />
    </div>
  )
}

function GoalStep({
  templates,
  selected,
  setSelected,
  onBack,
  onNext,
}: {
  templates: GoalTemplate[]
  selected: string[]
  setSelected: React.Dispatch<React.SetStateAction<string[]>>
  onBack: () => void
  onNext: () => void
}) {
  const toggle = (id: string) => {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  }
  return (
    <div>
      <h2 className="text-xl font-semibold">选择成长目标</h2>
      <p className="mt-1 text-sm text-muted-foreground">可多选，系统会自动拆解为每日任务</p>
      <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {templates.map((t) => {
          const active = selected.includes(t.id)
          const color = DIMENSION_COLORS[t.category as DimensionId] ?? '#60A5FA'
          return (
            <button
              key={t.id}
              onClick={() => toggle(t.id)}
              className={cn(
                'rounded-2xl border p-4 text-left transition-all duration-300',
                active ? 'border-primary/50 bg-primary/10 shadow-glow' : 'border-black/15 bg-white/60 hover:bg-white/90'
              )}
            >
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: color }} />
                <span className="text-sm font-semibold">{t.title}</span>
              </span>
              <span className="mt-1.5 block text-xs leading-relaxed text-muted-foreground">{t.description}</span>
            </button>
          )
        })}
      </div>
      <StepNav onBack={onBack} onNext={onNext} nextLabel="开始自评" />
    </div>
  )
}

function AssessStep({
  dims,
  questions,
  answers,
  onAnswer,
  onBack,
  onFinish,
  saving,
}: {
  dims: DimensionMeta[]
  questions: Map<DimensionId, AssessmentQuestion[]>
  answers: Record<string, number[]>
  onAnswer: (q: AssessmentQuestion, score: number) => void
  onBack: () => void
  onFinish: () => void
  saving: boolean
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold">8 维度健康自评</h2>
      <p className="mt-1 text-sm text-muted-foreground">如实作答，系统将为你生成体检报告与建议</p>

      <div className="mt-5 max-h-[52vh] space-y-6 overflow-y-auto pr-1">
        {dims.map((dim) => {
          const qs = questions.get(dim.id) ?? []
          if (qs.length === 0) return null
          const done = qs.every((q) => (answers[dim.id] ?? [])[qs.findIndex((x) => x.id === q.id)] > 0)
          return (
            <div key={dim.id} className={cn('rounded-2xl border p-4', done ? 'border-success/25' : 'border-black/15')}>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: DIMENSION_COLORS[dim.id] }} />
                <h3 className="text-sm font-semibold">{dim.label}</h3>
                <span className="ml-auto text-[10px] text-muted-foreground">{done ? '✓ 已完成' : '待作答'}</span>
              </div>
              <div className="mt-3 space-y-3">
                {qs.map((q) => {
                  const dimQs = questions.get(dim.id) ?? []
                  const cur = (answers[dim.id] ?? [])[dimQs.findIndex((x) => x.id === q.id)] ?? 0
                  return (
                    <div key={q.id}>
                      <p className="text-xs text-foreground/85">{q.text}</p>
                      <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                        {q.options.map((opt) => (
                          <button
                            key={opt.score}
                            onClick={() => onAnswer(q, opt.score)}
                            className={cn(
                              'rounded-lg border px-2 py-1.5 text-left text-[11px] transition-all',
                              cur === opt.score
                                ? 'border-primary/50 bg-primary/15 text-foreground'
                                : 'border-black/15 text-muted-foreground hover:bg-black/5'
                            )}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" /> 上一步
        </Button>
        <Button onClick={onFinish} disabled={saving}>
          {saving ? '生成中...' : '完成，开启成长之旅'} {!saving && <Rocket className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}
