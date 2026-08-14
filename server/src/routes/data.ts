import { Router } from 'express'
import { db } from '../db'
import { seedContentLibrary } from '../seed'

const router = Router()

const BUSINESS_TABLES = ['profile', 'goals', 'tasks', 'timeblocks', 'checkins', 'assessments', 'content_assignments']

function dump() {
  const data: Record<string, any[]> = {}
  for (const t of BUSINESS_TABLES) {
    data[t] = db.prepare(`SELECT * FROM ${t}`).all() as any[]
  }
  data.content_library_custom = db
    .prepare("SELECT * FROM content_library WHERE origin = 'custom'")
    .all() as any[]
  return data
}

function clearAll() {
  db.transaction(() => {
    for (const t of BUSINESS_TABLES) db.prepare(`DELETE FROM ${t}`).run()
    db.prepare("DELETE FROM content_library WHERE origin = 'custom'").run()
  })()
}

function restore(data: any) {
  clearAll()
  db.transaction(() => {
    const insertProfile = db.prepare(
      `INSERT OR REPLACE INTO profile (id, name, onboarded, wake_time, sleep_time, work_start, work_end, commute_min, work_days, created_at)
       VALUES (@id, @name, @onboarded, @wake_time, @sleep_time, @work_start, @work_end, @commute_min, @work_days, @created_at)`
    )
    for (const r of data.profile ?? []) insertProfile.run(r)

    const insertGoals = db.prepare(
      `INSERT OR REPLACE INTO goals (id, title, description, category, template_id, target_days, status, weekly_days, created_at)
       VALUES (@id, @title, @description, @category, @template_id, @target_days, @status, @weekly_days, @created_at)`
    )
    for (const r of data.goals ?? []) insertGoals.run(r)

    const insertTasks = db.prepare(
      `INSERT OR REPLACE INTO tasks (id, goal_id, title, category, source, date, content_id, duration_min, sort_order)
       VALUES (@id, @goal_id, @title, @category, @source, @date, @content_id, @duration_min, @sort_order)`
    )
    for (const r of data.tasks ?? []) insertTasks.run(r)

    const insertBlocks = db.prepare(
      `INSERT OR REPLACE INTO timeblocks (id, date, start, end, title, kind, task_id, locked)
       VALUES (@id, @date, @start, @end, @title, @kind, @task_id, @locked)`
    )
    for (const r of data.timeblocks ?? []) insertBlocks.run(r)

    const insertCheckins = db.prepare(
      `INSERT OR REPLACE INTO checkins (date, task_id, completed, completed_at, duration_min)
       VALUES (@date, @task_id, @completed, @completed_at, @duration_min)`
    )
    for (const r of data.checkins ?? []) insertCheckins.run(r)

    const insertAssessments = db.prepare(
      `INSERT OR REPLACE INTO assessments (id, date, scores, answers, suggestions)
       VALUES (@id, @date, @scores, @answers, @suggestions)`
    )
    for (const r of data.assessments ?? []) insertAssessments.run(r)

    const insertAssign = db.prepare(
      'INSERT OR REPLACE INTO content_assignments (date, content_id) VALUES (@date, @content_id)'
    )
    for (const r of data.content_assignments ?? []) insertAssign.run(r)

    const insertCustom = db.prepare(
      `INSERT OR REPLACE INTO content_library (id, type, title, category, summary, duration_min, text_body, video_url, embed_url, link, origin, created_at)
       VALUES (@id, @type, @title, @category, @summary, @duration_min, @text_body, @video_url, @embed_url, @link, 'custom', @created_at)`
    )
    for (const r of data.content_library_custom ?? []) insertCustom.run(r)
  })()
}

/** GET /api/v1/data/export */
router.get('/export', (_req, res) => {
  res.json({ exportedAt: new Date().toISOString(), data: dump() })
})

/** POST /api/v1/data/import */
router.post('/import', (req, res) => {
  const body = req.body ?? {}
  const data = body.data ?? body
  if (!data || typeof data !== 'object' || !Array.isArray(data.goals)) {
    res.status(400).json({ error: '导入数据格式不正确' })
    return
  }
  restore(data)
  res.json({ ok: true })
})

/** POST /api/v1/data/reset（清空业务数据，保留内置内容库） */
router.post('/reset', (_req, res) => {
  clearAll()
  seedContentLibrary()
  res.json({ ok: true })
})

export default router
