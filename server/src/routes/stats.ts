import { Router } from 'express'
import { db } from '../db'
import { getWeekDay } from '../engine/decomposer'
import { addDays, todayStr } from '../util'

const router = Router()

interface DayCount {
  date: string
  count: number
}

/** 某日期区间内：每日已完成任务数 */
function dayCounts(from: Date, to: Date): Map<string, number> {
  const map = new Map<string, number>()
  const rows = db
    .prepare('SELECT date, COUNT(*) AS c FROM checkins WHERE completed = 1 AND date >= ? AND date <= ? GROUP BY date')
    .all(todayStr(from), todayStr(to)) as any[]
  for (const r of rows) map.set(r.date, r.c)
  return map
}

/** GET /api/v1/stats */
router.get('/', (_req, res) => {
  const today = todayStr()
  const now = new Date()

  // —— 今日 ——
  const todayTotal = (db.prepare('SELECT COUNT(*) AS c FROM tasks WHERE date = ?').get(today) as any).c
  const todayDone = (db.prepare('SELECT COUNT(*) AS c FROM checkins WHERE date = ? AND completed = 1').get(today) as any).c

  // —— 连续打卡天数 ——
  const doneDates = new Set(
    (db.prepare('SELECT DISTINCT date FROM checkins WHERE completed = 1 ORDER BY date DESC').all() as any[]).map(
      (r) => r.date
    )
  )
  let streak = 0
  let cursor = new Date(now)
  if (!doneDates.has(todayStr(cursor))) cursor = addDays(cursor, -1)
  while (doneDates.has(todayStr(cursor))) {
    streak++
    cursor = addDays(cursor, -1)
  }

  // —— 周 / 月完成率 ——
  const dow = (now.getDay() + 6) % 7 // 周一=0
  const monday = addDays(now, -dow)
  const sunday = addDays(monday, 6)

  const weekTask = (db.prepare('SELECT COUNT(*) AS c FROM tasks WHERE date >= ? AND date <= ?').get(todayStr(monday), todayStr(sunday)) as any).c
  const weekDone = (db.prepare('SELECT COUNT(*) AS c FROM checkins WHERE completed = 1 AND date >= ? AND date <= ?').get(todayStr(monday), todayStr(sunday)) as any).c

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const monthTask = (db.prepare('SELECT COUNT(*) AS c FROM tasks WHERE date >= ? AND date <= ?').get(todayStr(monthStart), todayStr(monthEnd)) as any).c
  const monthDone = (db.prepare('SELECT COUNT(*) AS c FROM checkins WHERE completed = 1 AND date >= ? AND date <= ?').get(todayStr(monthStart), todayStr(monthEnd)) as any).c

  // —— 累计时长（已打卡任务的计划时长） ——
  const duration = (
    db.prepare(
      `SELECT COALESCE(SUM(t.duration_min), 0) AS s FROM tasks t JOIN checkins ck ON ck.task_id = t.id AND ck.completed = 1`
    ).get() as any
  ).s

  // —— 热力图（近 90 天） ——
  const heatFrom = addDays(now, -89)
  const counts = dayCounts(heatFrom, now)
  const heatmap: DayCount[] = []
  for (let i = 0; i < 90; i++) {
    const d = addDays(heatFrom, i)
    const ds = todayStr(d)
    heatmap.push({ date: ds, count: counts.get(ds) ?? 0 })
  }

  // —— 趋势（近 12 周完成率） ——
  const trendFrom = addDays(now, -11 * 7 - 6)
  const taskByDate = new Map<string, number>()
  const rows = db
    .prepare('SELECT date, COUNT(*) AS c FROM tasks WHERE date >= ? GROUP BY date')
    .all(todayStr(trendFrom)) as any[]
  for (const r of rows) taskByDate.set(r.date, r.c)
  const doneByDate = dayCounts(trendFrom, now)

  const trend: { date: string; rate: number }[] = []
  for (let w = 11; w >= 0; w--) {
    const ws = addDays(now, -(w * 7) - dow)
    const we = addDays(ws, 6)
    let taskSum = 0
    let doneSum = 0
    for (let i = 0; i < 7; i++) {
      const ds = todayStr(addDays(ws, i))
      taskSum += taskByDate.get(ds) ?? 0
      doneSum += doneByDate.get(ds) ?? 0
    }
    trend.push({ date: todayStr(ws), rate: taskSum > 0 ? Math.round((doneSum / taskSum) * 100) : 0 })
  }

  // —— 维度成长历史（最近两次体检） ——
  const assessmentRows = db
    .prepare('SELECT id, date, scores FROM assessments ORDER BY date DESC, id DESC LIMIT 2')
    .all() as any[]
  const dimensionHistory = assessmentRows.map((r) => ({
    date: r.date,
    scores: JSON.parse(r.scores) as Record<string, number>,
  }))

  res.json({
    streakDays: streak,
    todayCompleted: todayDone,
    todayTotal,
    weekRate: weekTask > 0 ? Math.round((weekDone / weekTask) * 100) : 0,
    monthRate: monthTask > 0 ? Math.round((monthDone / monthTask) * 100) : 0,
    totalDurationMin: duration,
    heatmap,
    trend,
    dimensionHistory,
    _weekOfToday: getWeekDay(today),
  })
})

export default router
