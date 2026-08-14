import { Router } from 'express'
import type { ProfileInput } from '../../shared/types'
import { db, rowToProfile } from '../db'

const router = Router()

function getProfile() {
  const row = db.prepare('SELECT * FROM profile WHERE id = 1').get() as any
  return row ? rowToProfile(row) : null
}

/** GET /api/v1/profile */
router.get('/', (_req, res) => {
  res.json({ profile: getProfile() })
})

/** PUT /api/v1/profile（upsert） */
router.put('/', (req, res) => {
  const body = (req.body ?? {}) as Partial<ProfileInput> & { onboarded?: boolean }
  if (!body.wakeTime || !body.sleepTime || !body.workStart || !body.workEnd) {
    res.status(400).json({ error: '缺少作息字段：wakeTime/sleepTime/workStart/workEnd' })
    return
  }
  db.prepare(
    `INSERT INTO profile (id, name, onboarded, wake_time, sleep_time, work_start, work_end, commute_min, work_days)
     VALUES (1, @name, @onboarded, @wakeTime, @sleepTime, @workStart, @workEnd, @commuteMin, @workDays)
     ON CONFLICT(id) DO UPDATE SET
       name = @name,
       onboarded = @onboarded,
       wake_time = @wakeTime,
       sleep_time = @sleepTime,
       work_start = @workStart,
       work_end = @workEnd,
       commute_min = @commuteMin,
       work_days = @workDays`
  ).run({
    name: body.name ?? '',
    onboarded: body.onboarded ? 1 : 0,
    wakeTime: body.wakeTime,
    sleepTime: body.sleepTime,
    workStart: body.workStart,
    workEnd: body.workEnd,
    commuteMin: body.commuteMin ?? 30,
    workDays: JSON.stringify(body.workDays ?? [1, 2, 3, 4, 5]),
  })
  res.json({ profile: getProfile() })
})

export default router
