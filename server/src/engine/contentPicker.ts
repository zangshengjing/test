import type { LearningContent } from '../../shared/types'
import { db } from '../db'
import { rowToContent } from '../db'

/**
 * 为某日分配"今日学习内容"：
 * - 已分配过则直接返回该条
 * - 优先选择分类匹配 active 目标、且从未被分配过的内容
 * - 全部轮换完后回绕最久未分配的内容
 */
export function pickTodayContent(date: string): LearningContent | null {
  const assigned = db.prepare('SELECT content_id FROM content_assignments WHERE date = ?').get(date) as
    | { content_id: string }
    | undefined
  if (assigned) {
    const row = db.prepare('SELECT * FROM content_library WHERE id = ?').get(assigned.content_id) as any
    return row ? (rowToContent(row) as LearningContent) : null
  }

  const all = db.prepare('SELECT * FROM content_library ORDER BY created_at ASC').all() as any[]
  if (all.length === 0) return null

  const assignedIds = new Set(
    (db.prepare('SELECT content_id FROM content_assignments').all() as any[]).map((r) => r.content_id)
  )
  const goalCats = new Set(
    (db.prepare("SELECT category FROM goals WHERE status = 'active'").all() as any[]).map((r) => r.category)
  )

  // 候选池：分类匹配 + 从未分配
  let candidates = all.filter(
    (c) =>
      !assignedIds.has(c.id) &&
      (goalCats.size === 0 || goalCats.has(c.category) || c.category === 'mind')
  )

  // 回退 1：未分配但分类不匹配
  if (candidates.length === 0) {
    candidates = all.filter((c) => !assignedIds.has(c.id))
  }

  // 回退 2：全部轮换完 → 最久未分配的一条
  if (candidates.length === 0) {
    const oldest = db
      .prepare('SELECT content_id FROM content_assignments ORDER BY date ASC LIMIT 1')
      .get() as { content_id: string } | undefined
    if (oldest) {
      const row = db.prepare('SELECT * FROM content_library WHERE id = ?').get(oldest.content_id) as any
      if (row) candidates = [row]
    }
  }

  if (candidates.length === 0) return null

  // 可预测地选取：按 id 排序取第一条，保证同一天结果稳定
  candidates.sort((a, b) => (a.id < b.id ? -1 : 1))
  const picked = candidates[0]

  db.prepare('INSERT OR REPLACE INTO content_assignments (date, content_id) VALUES (?, ?)').run(date, picked.id)
  return rowToContent(picked) as LearningContent
}
