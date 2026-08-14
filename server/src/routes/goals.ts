import { Router } from 'express'
import type { GoalInput } from '../../shared/types'
import { db, rowToContent, rowToGoal } from '../db'
import { genId } from '../util'

const router = Router()

/** 目标分类 -> 内容库分类匹配（覆盖内容库中的扩展分类） */
const CATEGORY_ALIAS: Record<string, string[]> = {
  study: ['study', 'skill'],
  fitness: ['fitness', 'body'],
  finance: ['finance'],
  family: ['family', 'social'],
  mind: ['mind'],
  life: ['life'],
}

/** 目标进度：关联任务完成率 */
export function goalProgress(goalId: string) {
  const total = db.prepare('SELECT COUNT(*) AS c FROM tasks WHERE goal_id = ?').get(goalId) as any
  const done = db
    .prepare(
      `SELECT COUNT(*) AS c FROM tasks t
       JOIN checkins ck ON ck.task_id = t.id AND ck.completed = 1
       WHERE t.goal_id = ?`
    )
    .get(goalId) as any
  return {
    total: total.c,
    done: done.c,
    rate: total.c > 0 ? Math.round((done.c / total.c) * 100) : 0,
  }
}

function withProgress(row: any) {
  return { ...rowToGoal(row), progress: goalProgress(row.id) }
}

/** GET /api/v1/goals */
router.get('/', (_req, res) => {
  const rows = db.prepare('SELECT * FROM goals ORDER BY created_at DESC').all() as any[]
  res.json({ goals: rows.map(withProgress) })
})

/** GET /api/v1/goals/:id — 单个目标详情（含进度） */
router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM goals WHERE id = ?').get(req.params.id) as any
  if (!row) {
    res.status(404).json({ error: '目标不存在' })
    return
  }
  res.json({ goal: withProgress(row) })
})

/** GET /api/v1/goals/:id/recommend — 与目标匹配的最新热门文字/视频内容 */
router.get('/:id/recommend', (req, res) => {
  const row = db.prepare('SELECT * FROM goals WHERE id = ?').get(req.params.id) as any
  if (!row) {
    res.status(404).json({ error: '目标不存在' })
    return
  }
  const cats = CATEGORY_ALIAS[row.category] ?? [row.category]
  const placeholders = cats.map(() => '?').join(',')
  const rows = db
    .prepare(
      `SELECT * FROM content_library
       WHERE category IN (${placeholders})
       ORDER BY COALESCE(published_at, '') DESC, views DESC, created_at DESC
       LIMIT 10`
    )
    .all(...cats) as any[]
  // 若按分类匹配不足 3 条，补充全库最新热门内容
  let contents = rows.map(rowToContent)
  if (contents.length < 3) {
    const extra = db
      .prepare(`SELECT * FROM content_library ORDER BY COALESCE(published_at, '') DESC, views DESC, created_at DESC LIMIT 10`)
      .all() as any[]
    const known = new Set(contents.map((c) => c.id))
    for (const e of extra) {
      if (known.has(e.id)) continue
      contents.push(rowToContent(e))
      known.add(e.id)
      if (contents.length >= 10) break
    }
  }
  res.json({ contents })
})

/** POST /api/v1/goals */
router.post('/', (req, res) => {
  const g = (req.body ?? {}) as GoalInput
  if (!g.title) {
    res.status(400).json({ error: '缺少目标标题' })
    return
  }
  const id = genId('goal')
  db.prepare(
    `INSERT INTO goals (id, title, description, category, template_id, target_days, status, weekly_days)
     VALUES (@id, @title, @description, @category, @templateId, @targetDays, 'active', @weeklyDays)`
  ).run({
    id,
    title: g.title,
    description: g.description ?? '',
    category: g.category ?? 'study',
    templateId: g.templateId ?? null,
    targetDays: g.targetDays ?? 90,
    weeklyDays: JSON.stringify(g.weeklyDays ?? [1, 2, 3, 4, 5, 6, 0]),
  })
  res.status(201).json({ goal: withProgress(db.prepare('SELECT * FROM goals WHERE id = ?').get(id)) })
})

/** PATCH /api/v1/goals/:id */
router.patch('/:id', (req, res) => {
  const id = req.params.id
  const row = db.prepare('SELECT * FROM goals WHERE id = ?').get(id) as any
  if (!row) {
    res.status(404).json({ error: '目标不存在' })
    return
  }
  const cur = rowToGoal(row)
  const p = (req.body ?? {}) as Partial<GoalInput> & { status?: string }
  const next = {
    title: p.title ?? cur.title,
    description: p.description ?? cur.description,
    category: p.category ?? cur.category,
    status: p.status ?? cur.status,
    targetDays: p.targetDays ?? cur.targetDays,
    weeklyDays: JSON.stringify(p.weeklyDays ?? cur.weeklyDays),
  }
  db.prepare(
    `UPDATE goals SET title=@title, description=@description, category=@category,
       status=@status, target_days=@targetDays, weekly_days=@weeklyDays
     WHERE id=@id`
  ).run({ ...next, id })
  res.json({ goal: withProgress(db.prepare('SELECT * FROM goals WHERE id = ?').get(id)) })
})

/** DELETE /api/v1/goals/:id */
router.delete('/:id', (req, res) => {
  const id = req.params.id
  const row = db.prepare('SELECT * FROM goals WHERE id = ?').get(id) as any
  if (!row) {
    res.status(404).json({ error: '目标不存在' })
    return
  }
  const taskIds = (db.prepare('SELECT id FROM tasks WHERE goal_id = ?').all(id) as any[]).map((r) => r.id)
  db.transaction(() => {
    for (const tid of taskIds) {
      db.prepare('DELETE FROM checkins WHERE task_id = ?').run(tid)
      db.prepare('DELETE FROM timeblocks WHERE task_id = ?').run(tid)
    }
    db.prepare('DELETE FROM tasks WHERE goal_id = ?').run(id)
    db.prepare('DELETE FROM goals WHERE id = ?').run(id)
  })()
  res.json({ ok: true })
})

export default router
