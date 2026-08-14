import type { Profile, Task, TimeBlock, TimeBlockKind } from '../../shared/types'
import { getWeekDay } from './decomposer'

// ---------------- 时间工具 ----------------
export function toMin(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

export function toHHMM(min: number): string {
  const h = Math.floor(min / 60) % 24
  const m = min % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function addMin(t: string, add: number): string {
  return toHHMM(toMin(t) + add)
}

interface FixedBlock {
  start: string
  end: string
  title: string
  kind: TimeBlockKind
  taskId?: string | null
}

/**
 * 生成 24 小时时间表：
 * - 依据 profile 作息生成固定块（睡眠/晨间/通勤/工作/用餐/睡前）
 * - 学习与健身任务自动插入黄金时段空隙（study 优先）
 * - 返回完整块列表（不含 id/locked，由调用方落库）
 */
export function buildSchedule(profile: Profile, tasks: Task[], date: string): TimeBlock[] {
  const wake = profile.wakeTime
  const sleep = profile.sleepTime
  const workStart = profile.workStart
  const workEnd = profile.workEnd
  const commute = Math.max(profile.commuteMin, 10)
  const isWorkday = profile.workDays.includes(getWeekDay(date))

  const fixed: FixedBlock[] = []

  // 1. 睡眠（拆成午夜前 / 午夜后两段，便于渲染）
  fixed.push({ start: sleep, end: '24:00', title: '睡眠', kind: 'sleep' })
  fixed.push({ start: '00:00', end: wake, title: '睡眠', kind: 'sleep' })

  // 2. 晨间唤醒
  fixed.push({ start: wake, end: addMin(wake, 45), title: '晨间唤醒 · 洗漱与早餐', kind: 'meal' })

  if (isWorkday) {
    // 3. 通勤（上班）+ 工作 + 通勤（下班）
    const commuteOutStart = addMin(workStart, -commute)
    fixed.push({ start: commuteOutStart, end: workStart, title: '通勤 · 去公司', kind: 'commute' })
    fixed.push({ start: workStart, end: workEnd, title: '工作 · 深度专注', kind: 'work' })

    // 4. 午餐（工作日内嵌）
    if (toMin(workEnd) - toMin(workStart) >= 300) {
      const lunchStart = toMin(workStart) + Math.round((toMin(workEnd) - toMin(workStart)) * 0.45)
      fixed.push({
        start: toHHMM(lunchStart),
        end: toHHMM(lunchStart + 60),
        title: '午餐 · 休息',
        kind: 'meal',
      })
    }
    fixed.push({ start: workEnd, end: addMin(workEnd, commute), title: '通勤 · 回家', kind: 'commute' })
  } else {
    // 周末：晨间自由时间
    fixed.push({ start: addMin(wake, 45), end: addMin(wake, 150), title: '周末晨间 · 自由安排', kind: 'free' })
  }

  // 5. 晚餐
  const dinnerStart = isWorkday ? addMin(workEnd, commute) : addMin(wake, 150)
  fixed.push({ start: dinnerStart, end: addMin(dinnerStart, 60), title: '晚餐 · 家庭时光', kind: 'meal' })

  // 6. 睡前放松
  fixed.push({ start: addMin(sleep, -30), end: sleep, title: '睡前放松 · 复盘明日', kind: 'free' })

  // 7. 在空隙中插入学习 / 健身任务
  const dayBlocks = [...fixed]
    .map((b) => ({ ...b, start: toMin(b.start), end: toMin(b.end) }))
    .sort((a, b) => a.start - b.start)

  const todoTasks = tasks
    .filter((t) => t.category === 'study' || t.category === 'fitness' || t.category === 'mind')
    .sort((a, b) => a.sortOrder - b.sortOrder)

  // 收集空隙（严格递增且不重叠）
  const gaps: { start: number; end: number }[] = []
  let cursor = 0
  for (const b of dayBlocks) {
    if (b.start > cursor) gaps.push({ start: cursor, end: b.start })
    cursor = Math.max(cursor, b.end)
  }
  if (cursor < 1440) gaps.push({ start: cursor, end: 1440 })

  const taskBlocks: FixedBlock[] = []
  // 工作日：优先把学习/健身任务排进下班后的晚间空闲；周末：优先白天
  const eveningStart = isWorkday ? toMin(workEnd) + commute : Infinity
  const eveningGaps = gaps.filter((g) => g.start >= eveningStart)
  const otherGaps = gaps.filter((g) => g.start < eveningStart)
  const placeTask = (t: Task, pool: { start: number; end: number }[]) => {
    const need = Math.min(Math.max(t.durationMin, 10), 120)
    const gap = pool.find((g) => g.end - g.start >= need)
    if (!gap) return false
    taskBlocks.push({
      start: toHHMM(gap.start),
      end: toHHMM(gap.start + need),
      title: t.title,
      kind: t.category === 'fitness' ? 'fitness' : 'study',
      taskId: t.id,
    })
    gap.start += need
    return true
  }
  for (const t of todoTasks) {
    if (placeTask(t, eveningGaps)) continue
    placeTask(t, otherGaps)
  }

  const all: TimeBlock[] = [...fixed, ...taskBlocks].map((b, i) => ({
    id: `tb-${date}-${i}`,
    date,
    start: b.start,
    end: b.end,
    title: b.title,
    kind: b.kind,
    taskId: b.taskId ?? null,
    locked: false,
  }))

  return all
}
