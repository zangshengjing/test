import { Router } from 'express'
import type { LearningContentInput } from '../../shared/types'
import { db, rowToContent } from '../db'
import { pickTodayContent } from '../engine/contentPicker'
import { genId, todayStr } from '../util'

const router = Router()

/** GET /api/v1/content/today?date=YYYY-MM-DD */
router.get('/today', (req, res) => {
  const date = (req.query.date as string) || todayStr()
  res.json({ date, content: pickTodayContent(date) })
})

/** GET /api/v1/content/library */
router.get('/library', (_req, res) => {
  const rows = db.prepare('SELECT * FROM content_library ORDER BY origin ASC, created_at ASC').all() as any[]
  res.json({ contents: rows.map(rowToContent) })
})

/** POST /api/v1/content（自定义内容） */
router.post('/', (req, res) => {
  const c = (req.body ?? {}) as LearningContentInput
  if (!c.title) {
    res.status(400).json({ error: '缺少内容标题' })
    return
  }
  const id = genId('ct')
  db.prepare(
    `INSERT INTO content_library (id, type, title, category, summary, duration_min, text_body, video_url, embed_url, link, origin)
     VALUES (@id, @type, @title, @category, @summary, @durationMin, @textBody, @videoUrl, @embedUrl, @link, 'custom')`
  ).run({
    id,
    type: c.type ?? 'text',
    title: c.title,
    category: c.category ?? 'study',
    summary: c.summary ?? '',
    durationMin: c.durationMin ?? 20,
    textBody: c.textBody ?? null,
    videoUrl: c.videoUrl ?? null,
    embedUrl: c.embedUrl ?? null,
    link: c.link ?? null,
  })
  res.status(201).json({ content: rowToContent(db.prepare('SELECT * FROM content_library WHERE id = ?').get(id)) })
})

/** PATCH /api/v1/content/:id */
router.patch('/:id', (req, res) => {
  const id = req.params.id
  const row = db.prepare('SELECT * FROM content_library WHERE id = ?').get(id) as any
  if (!row) {
    res.status(404).json({ error: '内容不存在' })
    return
  }
  if (row.origin !== 'custom') {
    res.status(403).json({ error: '内置内容不可修改' })
    return
  }
  const cur = rowToContent(row)
  const p = (req.body ?? {}) as Partial<LearningContentInput>
  db.prepare(
    `UPDATE content_library SET type=@type, title=@title, category=@category, summary=@summary,
       duration_min=@durationMin, text_body=@textBody, video_url=@videoUrl, embed_url=@embedUrl, link=@link
     WHERE id=@id`
  ).run({
    id,
    type: p.type ?? cur.type,
    title: p.title ?? cur.title,
    category: p.category ?? cur.category,
    summary: p.summary ?? cur.summary,
    durationMin: p.durationMin ?? cur.durationMin,
    textBody: p.textBody ?? cur.textBody ?? null,
    videoUrl: p.videoUrl ?? cur.videoUrl ?? null,
    embedUrl: p.embedUrl ?? cur.embedUrl ?? null,
    link: p.link ?? cur.link ?? null,
  })
  res.json({ content: rowToContent(db.prepare('SELECT * FROM content_library WHERE id = ?').get(id)) })
})

/** DELETE /api/v1/content/:id */
router.delete('/:id', (req, res) => {
  const id = req.params.id
  const row = db.prepare('SELECT * FROM content_library WHERE id = ?').get(id) as any
  if (!row) {
    res.status(404).json({ error: '内容不存在' })
    return
  }
  if (row.origin !== 'custom') {
    res.status(403).json({ error: '内置内容不可删除' })
    return
  }
  db.prepare('DELETE FROM content_library WHERE id = ?').run(id)
  res.json({ ok: true })
})

export default router
