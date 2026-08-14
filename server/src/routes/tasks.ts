import { Router } from 'express'
import type { TaskInput } from '../../shared/types'
import { db, rowToProfile, rowToTask } from '../db'
import { ensureDayTasks, getDayTasks } from '../engine/decomposer'
import { genId, todayStr } from '../util'

const router = Router()

/** GET /api/v1/tasks?date=YYYY-MM-DD（惰性生成当日自动任务） */
router.get('/', (req, res) => {
  const date = (req.query.date as string) || todayStr()
  const profileRow = db.prepare('SELECT * FROM profile WHERE id = 1').get() as any
  const profile = profileRow ? rowToProfile(profileRow) : null
  if (!profile) {
    res.json({ date, tasks: [] })
    return
  }
  ensureDayTasks(profile, date)
  res.json({ date, tasks: getDayTasks(date) })
})

/** POST /api/v1/tasks（手动任务） */
router.post('/', (req, res) => {
  const body = (req.body ?? {}) as TaskInput & { date?: string }
  const date = body.date || todayStr()
  if (!body.title) {
    res.status(400).json({ error: '缺少任务标题' })
    return
  }
  const id = genId('task')
  const max = db.prepare('SELECT MAX(sort_order) AS m FROM tasks WHERE date = ?').get(date) as any
  db.prepare(
    `INSERT INTO tasks (id, goal_id, title, category, source, date, content_id, duration_min, sort_order)
     VALUES (@id, @goalId, @title, @category, 'manual', @date, @contentId, @durationMin, @sortOrder)`
  ).run({
    id,
    goalId: body.goalId ?? null,
    title: body.title,
    category: body.category ?? 'life',
    date,
    contentId: body.contentId ?? null,
    durationMin: body.durationMin ?? 30,
    sortOrder: (max.m ?? -1) + 1,
  })
  res.status(201).json({ task: rowToTask(db.prepare('SELECT * FROM tasks WHERE id = ?').get(id)) })
})

/** PATCH /api/v1/tasks/:id */
router.patch('/:id', (req, res) => {
  const id = req.params.id
  const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as any
  if (!row) {
    res.status(404).json({ error: '任务不存在' })
    return
  }
  const cur = rowToTask(row)
  const p = (req.body ?? {}) as Partial<TaskInput> & { sortOrder?: number }
  db.prepare(
    `UPDATE tasks SET title=@title, category=@category, duration_min=@durationMin, sort_order=@sortOrder WHERE id=@id`
  ).run({
    id,
    title: p.title ?? cur.title,
    category: p.category ?? cur.category,
    durationMin: p.durationMin ?? cur.durationMin,
    sortOrder: p.sortOrder ?? cur.sortOrder,
  })
  res.json({ task: rowToTask(db.prepare('SELECT * FROM tasks WHERE id = ?').get(id)) })
})

/** DELETE /api/v1/tasks/:id */
router.delete('/:id', (req, res) => {
  const id = req.params.id
  db.transaction(() => {
    db.prepare('DELETE FROM checkins WHERE task_id = ?').run(id)
    db.prepare('DELETE FROM timeblocks WHERE task_id = ?').run(id)
    db.prepare('DELETE FROM tasks WHERE id = ?').run(id)
  })()
  res.json({ ok: true })
})

export default router
