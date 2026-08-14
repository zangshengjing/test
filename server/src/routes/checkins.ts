import { Router } from 'express'
import { db } from '../db'
import { nowStr, todayStr } from '../util'

const router = Router()

function rowToCheckin(row: any) {
  return {
    date: row.date,
    taskId: row.task_id,
    completed: !!row.completed,
    completedAt: row.completed_at ?? null,
    durationMin: row.duration_min ?? null,
  }
}

/** GET /api/v1/checkins?date=YYYY-MM-DD */
router.get('/', (req, res) => {
  const date = (req.query.date as string) || todayStr()
  const rows = db.prepare('SELECT * FROM checkins WHERE date = ?').all(date) as any[]
  res.json({ date, checkins: rows.map(rowToCheckin) })
})

/** PUT /api/v1/checkins/:date/:taskId（幂等打卡） */
router.put('/:date/:taskId', (req, res) => {
  const { date, taskId } = req.params
  const p = (req.body ?? {}) as { completed?: boolean; completedAt?: string; durationMin?: number }
  const completed = p.completed ? 1 : 0

  const existing = db.prepare('SELECT * FROM checkins WHERE date = ? AND task_id = ?').get(date, taskId) as any
  if (existing) {
    db.prepare(
      'UPDATE checkins SET completed = ?, completed_at = ?, duration_min = ? WHERE date = ? AND task_id = ?'
    ).run(
      completed,
      completed ? p.completedAt ?? nowStr() : null,
      p.durationMin ?? existing.duration_min,
      date,
      taskId
    )
  } else {
    db.prepare(
      'INSERT INTO checkins (date, task_id, completed, completed_at, duration_min) VALUES (?, ?, ?, ?, ?)'
    ).run(date, taskId, completed, completed ? p.completedAt ?? nowStr() : null, p.durationMin ?? null)
  }
  const row = db.prepare('SELECT * FROM checkins WHERE date = ? AND task_id = ?').get(date, taskId) as any
  res.json({ checkin: rowToCheckin(row) })
})

export default router
