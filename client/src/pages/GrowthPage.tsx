import { useCallback, useEffect, useMemo, useState } from 'react'
import { RefreshCw, ShieldCheck, TrendingUp } from 'lucide-react'
import type { Assessment, AssessmentQuestion, DimensionMeta, DimensionScore } from '../../../shared/types'
import { api } from '../api/client'
import { DimensionRadar } from '../components/charts/DimensionRadar'
import { DimensionCard } from '../components/common/DimensionCard'
import { AssessmentForm } from '../components/common/AssessmentForm'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { formatCN } from '../utils/date'
import { toast } from '../components/common/toast'

export default function GrowthPage() {
  const [latest, setLatest] = useState<Assessment | null>(null)
  const [previous, setPrevious] = useState<Assessment | null>(null)
  const [dimensions, setDimensions] = useState<DimensionMeta[]>([])
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([])
  const [reevalOpen, setReevalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(async () => {
    try {
      const [assRes, seedRes] = await Promise.all([
        api.get<{ latest: Assessment | null; previous: Assessment | null }>('/assessments'),
        api.get<{ library: { dimensions: DimensionMeta[]; questions: AssessmentQuestion[] } }>('/seed/library'),
      ])
      setLatest(assRes.latest)
      setPrevious(assRes.previous)
      setDimensions(seedRes.library.dimensions)
      setQuestions(seedRes.library.questions)
    } catch (e) {
      console.error('[growth] 加载失败', e)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const scores: DimensionScore[] = useMemo(() => {
    if (!latest) return []
    return dimensions.map((d) => {
      const v = latest.scores[d.id] ?? 0
      return {
        id: d.id,
        label: d.label,
        score: v,
        level: v >= 85 ? 'excellent' : v >= 70 ? 'good' : v >= 50 ? 'warning' : 'danger',
        advice: d.description,
      }
    })
  }, [latest, dimensions])

  const radarData = useMemo(
    () => scores.map((s) => ({ dimension: s.label, score: s.score })),
    [scores]
  )
  const prevRadar = useMemo(() => {
    if (!previous) return undefined
    return {
      key: formatCN(previous.date),
      data: dimensions.map((d) => ({ dimension: d.label, score: previous.scores[d.id] ?? 0 })),
    }
  }, [previous, dimensions])

  const submit = async (answers: Record<string, number[]>) => {
    setSubmitting(true)
    try {
      const res = await api.post<{ assessment: Assessment }>('/assessments', { answers })
      setLatest(res.assessment)
      setPrevious(latest)
      setReevalOpen(false)
      toast({ title: '测评完成', description: '新的成长报告已生成', type: 'success' })
    } catch (e) {
      console.error('[growth] 提交失败', e)
      toast({ title: '提交失败', type: 'warn' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-5 animate-in fade-in-0 duration-500">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">成长体检</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {latest ? `最近测评 · ${formatCN(latest.date)}` : '完成首次测评，生成 8 维度成长报告'}
          </p>
        </div>
        <Button onClick={() => setReevalOpen(true)}>
          <RefreshCw className="h-4 w-4" /> 重新测评
        </Button>
      </div>

      {!latest ? (
        <div className="glass flex flex-col items-center gap-4 rounded-3xl p-12 text-center">
          <div className="bg-gradient-brand flex h-16 w-16 items-center justify-center rounded-3xl shadow-glow">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">还没有成长报告</h2>
            <p className="mt-1 text-sm text-muted-foreground">完成 8 维度自评，获得雷达图与针对性改进建议</p>
          </div>
          <Button onClick={() => setReevalOpen(true)}>开始首次测评</Button>
        </div>
      ) : (
        <>
          <section className="glass rounded-3xl p-5">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-base font-semibold">8 维度能力雷达</h2>
              {previous && (
                <Badge variant="secondary">
                  <TrendingUp className="h-3 w-3" /> 与 {formatCN(previous.date)} 对比
                </Badge>
              )}
            </div>
            <DimensionRadar data={radarData} second={prevRadar} />
          </section>

          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {scores.map((s) => (
              <DimensionCard key={s.id} score={s} />
            ))}
          </section>

          <section className="glass rounded-3xl p-5">
            <h2 className="mb-3 text-base font-semibold">改进建议清单</h2>
            {latest.suggestions.length > 0 ? (
              <ol className="space-y-2.5">
                {latest.suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-3 rounded-xl bg-white/60 px-4 py-3">
                    <span className="bg-gradient-brand mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white">
                      {i + 1}
                    </span>
                    <span className="text-sm leading-relaxed text-foreground/85">{s}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-muted-foreground">各项表现优秀，保持节奏，向更高目标进发 🚀</p>
            )}
          </section>
        </>
      )}

      <Dialog open={reevalOpen} onOpenChange={setReevalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>8 维度健康自评</DialogTitle>
          </DialogHeader>
          <AssessmentForm
            dimensions={dimensions}
            questions={questions}
            submitting={submitting}
            onSubmit={submit}
            onCancel={() => setReevalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
