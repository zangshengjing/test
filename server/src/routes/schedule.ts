import { Router } from 'express'
import type { TimeBlockPatch } from '../../shared/types'
import { db, rowToProfile, rowToTimeBlock } from '../db'
import { ensureDayTasks } from '../engine/decomposer'
import { buildSchedule } from '../engine/scheduler'
import { todayStr } from '../util'

const router = Router()

/** GET /api/v1/schedule?date=YYYY-MM-DD（惰性生成时间表，保留 locked 手动块） */
router.get('/', (req, res) => {
  const date = (req.query.date as string) || todayStr()
  const profileRow = db.prepare('SELECT * FROM profile WHERE id = 1').get() as any
  const profile = profileRow ? rowToProfile(profileRow) : null
  if (!profile) {
    res.json({ date, blocks: [], generated: false })
    return
  }

  const tasks = ensureDayTasks(profile, date)
  const generated = buildSchedule(profile, tasks, date)

  const del = db.prepare('DELETE FROM timeblocks WHERE date = ? AND locked = 0')
  const ins = db.prepare(
    `INSERT OR REPLACE INTO timeblocks (id, date, start, end, title, kind, task_id, locked)
     VALUES (@id, @date, @start, @end, @title, @kind, @taskId, @locked)`
  )
  db.transaction(() => {
    del.run(date)
    for (const b of generated) {
      ins.run({
        id: b.id,
        date: b.date,
        start: b.start,
        end: b.end,
        title: b.title,
        kind: b.kind,
        taskId: b.taskId,
        locked: b.locked ? 1 : 0,
      })
    }
  })()

  const blocks = (db.prepare('SELECT * FROM timeblocks WHERE date = ? ORDER BY start ASC').all(date) as any[]).map(
    rowToTimeBlock
  )
  res.json({ date, blocks, generated: true })
})

/** PATCH /api/v1/schedule/:date/blocks/:id（手动调整，置为 locked） */
router.patch('/:date/blocks/:id', (req, res) => {
  const { date, id } = req.params
  const row = db.prepare('SELECT * FROM timeblocks WHERE id = ? AND date = ?').get(id, date) as any
  if (!row) {
    res.status(404).json({ error: '时间块不存在' })
    return
  }
  const cur = rowToTimeBlock(row)
  const p = (req.body ?? {}) as TimeBlockPatch
  db.prepare(
    `UPDATE timeblocks SET start=@start, end=@end, title=@title, kind=@kind, locked=1 WHERE id=@id AND date=@date`
  ).run({
    id,
    date,
    start: p.start ?? cur.start,
    end: p.end ?? cur.end,
    title: p.title ?? cur.title,
    kind: p.kind ?? cur.kind,
  })
  const updated = db.prepare('SELECT * FROM timeblocks WHERE id = ?').get(id) as any
  res.json({ block: rowToTimeBlock(updated) })
})

export default router
