import { useMemo, useState } from 'react'
import type { AssessmentQuestion, DimensionId, DimensionMeta } from '../../../../shared/types'
import { Button } from '../ui/button'
import { cn } from '../../lib/utils'
import { DIMENSION_COLORS } from '../../lib/constants'

interface AssessmentFormProps {
  dimensions: DimensionMeta[]
  questions: AssessmentQuestion[]
  submitting?: boolean
  onSubmit: (answers: Record<string, number[]>) => void
  onCancel?: () => void
}

/** 8 维度自评表单（复用于 Onboarding / 成长体检复测） */
export function AssessmentForm({ dimensions, questions, submitting, onSubmit, onCancel }: AssessmentFormProps) {
  const [answers, setAnswers] = useState<Record<string, number[]>>({})

  const byDim = useMemo(() => {
    const map = new Map<DimensionId, AssessmentQuestion[]>()
    for (const q of questions) {
      const list = map.get(q.dimension) ?? []
      list.push(q)
      map.set(q.dimension, list)
    }
    return map
  }, [questions])

  const pick = (q: AssessmentQuestion, score: number) => {
    setAnswers((prev) => {
      const dimQs = byDim.get(q.dimension) ?? []
      const list = prev[q.dimension] ?? []
      const next = [...list]
      while (next.length < dimQs.length) next.push(0)
      next[dimQs.findIndex((x) => x.id === q.id)] = score
      return { ...prev, [q.dimension]: next }
    })
  }

  const answered = useMemo(
    () =>
      questions.every(
        (q) => ((answers[q.dimension] ?? [])[byDim.get(q.dimension)?.findIndex((x) => x.id === q.id) ?? -1] ?? 0) > 0
      ),
    [answers, questions, byDim]
  )

  return (
    <div>
      <div className="max-h-[56vh] space-y-5 overflow-y-auto pr-1">
        {dimensions.map((dim) => {
          const qs = byDim.get(dim.id) ?? []
          if (qs.length === 0) return null
          const done = qs.every(
            (q) => ((answers[dim.id] ?? [])[qs.findIndex((x) => x.id === q.id)] ?? 0) > 0
          )
          return (
            <div
              key={dim.id}
              className={cn('rounded-2xl border p-4', done ? 'border-success/40' : 'border-black/15')}
            >
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: DIMENSION_COLORS[dim.id] }} />
                <h4 className="text-sm font-semibold">{dim.label}</h4>
                <span className="ml-auto text-[10px] text-muted-foreground">{done ? '✓' : '待答'}</span>
              </div>
              <div className="mt-3 space-y-3">
                {qs.map((q) => {
                  const cur = (answers[dim.id] ?? [])[qs.findIndex((x) => x.id === q.id)] ?? 0
                  return (
                    <div key={q.id}>
                      <p className="text-xs text-foreground/85">{q.text}</p>
                      <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                        {q.options.map((opt) => (
                          <button
                            key={opt.score}
                            type="button"
                            onClick={() => pick(q, opt.score)}
                            className={cn(
                              'rounded-lg border px-2 py-1.5 text-left text-[11px] transition-all',
                              cur === opt.score
                                ? 'border-primary/50 bg-primary/15 text-foreground'
                                : 'border-black/15 text-muted-foreground hover:bg-white/80'
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
      <div className="mt-5 flex items-center justify-end gap-2">
        {onCancel && (
          <Button variant="ghost" onClick={onCancel}>
            取消
          </Button>
        )}
        <Button onClick={() => onSubmit(answers)} disabled={!answered || submitting}>
          {submitting ? '提交中...' : '提交测评'}
        </Button>
      </div>
    </div>
  )
}
