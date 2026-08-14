import type { DimensionId, DimensionScore } from '../../shared/types'
import { DIMENSIONS } from '../seed'

export type AnswerMap = Record<DimensionId, number[]>

function adviceFor(score: number, description: string): string {
  if (score >= 85) return `非常出色，保持当前的节奏，可向更高目标发起挑战。`
  if (score >= 70) return `基础不错，建议每周固定安排时间持续强化，向优秀冲刺。`
  if (score >= 50) return `需要重点关注，建议从每天 10-20 分钟的小行动开始改善。`
  return `亟待改善，建议列入本周第一优先级，配合固定时间块执行。`
}

/**
 * 体检评分：维度均分 → 0-100 百分比
 * 返回维度得分与改进建议清单
 */
export function evaluateDimensions(answers: AnswerMap): {
  scores: DimensionScore[]
  suggestions: string[]
} {
  const scores: DimensionScore[] = []
  const suggestions: string[] = []

  for (const dim of DIMENSIONS) {
    const list = answers[dim.id as DimensionId] ?? []
    if (list.length === 0) continue
    const max = list.length * 5
    const sum = list.reduce((a, b) => a + b, 0)
    const score = Math.round((sum / max) * 100)
    const level: DimensionScore['level'] =
      score >= 85 ? 'excellent' : score >= 70 ? 'good' : score >= 50 ? 'warning' : 'danger'

    const advice = adviceFor(score, dim.description)
    scores.push({ id: dim.id, label: dim.label, score, level, advice })
    if (score < 70) {
      suggestions.push(`${dim.label}：${advice}`)
    }
  }

  // 建议按得分升序（越薄弱越靠前）
  suggestions.sort((a, b) => {
    const sa = scores.find((s) => a.startsWith(s.label))?.score ?? 100
    const sb = scores.find((s) => b.startsWith(s.label))?.score ?? 100
    return sa - sb
  })

  return { scores, suggestions }
}
