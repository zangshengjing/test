import type { Profile, Task } from '../../shared/types'
import { db } from '../db'
import { rowToGoal, rowToTask } from '../db'
import { GOAL_TEMPLATES } from '../seed'

/** 日期字符串 YYYY-MM-DD → 星期几（0=周日） */
export function getWeekDay(dateStr: string): number {
  return new Date(`${dateStr}T00:00:00`).getDay()
}

/** 确定性任务 ID */
export function makeTaskId(goalId: string, date: string, index: number): string {
  return `auto-${date}-${goalId}-${index}`
}

/**
 * 生成指定日期的自动任务（幂等）：
 * - 当天已有自动任务则直接返回
 * - 对每个 active 目标，按模板 weeklyDays 拆解为当日任务
 * - 无模板的自定义目标生成一条主任务
 */
export function ensureDayTasks(profile: Profile, date: string): Task[] {
  const existing = db
    .prepare("SELECT * FROM tasks WHERE date = ? AND source = 'auto' ORDER BY sort_order ASC")
    .all(date) as any[]
  if (existing.length > 0) return existing.map(rowToTask)

  const goals = db
    .prepare("SELECT * FROM goals WHERE status = 'active' ORDER BY created_at ASC")
    .all() as any[]
  const day = getWeekDay(date)
  const toInsert: any[] = []
  let sortOrder = 0

  for (const goalRow of goals) {
    const goal = rowToGoal(goalRow)
    if (!goal || !goal.weeklyDays.includes(day)) continue

    const tpl = goal.templateId ? GOAL_TEMPLATES.find((t) => t.id === goal.templateId) : undefined
    if (tpl) {
      tpl.tasks
        .filter((t) => t.weeklyDays.includes(day))
        .forEach((t, i) => {
          toInsert.push({
            id: makeTaskId(goal.id, date, i),
            goalId: goal.id,
            title: t.title,
            category: t.category,
            source: 'auto',
            date,
            contentId: null,
            durationMin: t.durationMin,
            sortOrder: sortOrder++,
          })
        })
    } else {
      toInsert.push({
        id: makeTaskId(goal.id, date, 0),
        goalId: goal.id,
        title: goal.title,
        category: goal.category,
        source: 'auto',
        date,
        contentId: null,
        durationMin: 30,
        sortOrder: sortOrder++,
      })
    }
  }

  const insert = db.prepare(
    `INSERT OR IGNORE INTO tasks
      (id, goal_id, title, category, source, date, content_id, duration_min, sort_order)
     VALUES (@id, @goalId, @title, @category, 'auto', @date, @contentId, @durationMin, @sortOrder)`
  )
  const run = db.transaction(() => {
    for (const t of toInsert) insert.run(t)
  })
  run()

  return db
    .prepare('SELECT * FROM tasks WHERE date = ? ORDER BY sort_order ASC')
    .all(date)
    .map(rowToTask) as Task[]
}

/** 读取某日全部任务（自动+手动） */
export function getDayTasks(date: string): Task[] {
  return db
    .prepare('SELECT * FROM tasks WHERE date = ? ORDER BY sort_order ASC')
    .all(date)
    .map(rowToTask) as Task[]
}
