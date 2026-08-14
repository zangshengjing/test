import { Router } from 'express'
import type { AssessmentSubmit } from '../../shared/types'
import { db, rowToAssessment } from '../db'
import { evaluateDimensions } from '../engine/evaluator'
import { todayStr } from '../util'

const router = Router()

/** GET /api/v1/assessments（历史 + 最近两次对比） */
router.get('/', (_req, res) => {
  const rows = db.prepare('SELECT * FROM assessments ORDER BY date DESC, id DESC').all() as any[]
  const assessments = rows.map(rowToAssessment)
  res.json({
    assessments,
    latest: assessments[0] ?? null,
    previous: assessments[1] ?? null,
  })
})

/** POST /api/v1/assessments（提交自评） */
router.post('/', (req, res) => {
  const body = (req.body ?? {}) as AssessmentSubmit
  if (!body.answers || Object.keys(body.answers).length === 0) {
    res.status(400).json({ error: '缺少答题数据 answers' })
    return
  }
  const { scores, suggestions } = evaluateDimensions(body.answers)
  const scoresObj: Record<string, number> = {}
  for (const s of scores) scoresObj[s.id] = s.score

  const info = db
    .prepare('INSERT INTO assessments (date, scores, answers, suggestions) VALUES (?, ?, ?, ?)')
    .run(todayStr(), JSON.stringify(scoresObj), JSON.stringify(body.answers), JSON.stringify(suggestions))
  const id = Number(info.lastInsertRowid)
  res.status(201).json({ assessment: rowToAssessment(db.prepare('SELECT * FROM assessments WHERE id = ?').get(id)) })
})

export default router
