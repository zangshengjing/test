/** 本地时区 YYYY-MM-DD */
export function fmtDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

/** 今天 YYYY-MM-DD */
export function todayStr(): string {
  return fmtDate(new Date())
}

/** 日期加减 */
export function addDays(d: Date, n: number): Date {
  const nd = new Date(d)
  nd.setDate(nd.getDate() + n)
  return nd
}

/** 日期字符串 → 星期几（0=周日） */
export function getWeekDay(dateStr: string): number {
  return new Date(`${dateStr}T00:00:00`).getDay()
}

export const WEEK_LABELS = ['日', '一', '二', '三', '四', '五', '六']

/** 日期 → 友好中文："8月14日 · 周五" */
export function formatCN(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`)
  return `${d.getMonth() + 1}月${d.getDate()}日 · 周${WEEK_LABELS[d.getDay()]}`
}

/** 相对今天的中文描述 */
export function relativeDay(dateStr: string): string {
  const today = todayStr()
  if (dateStr === today) return '今天'
  if (dateStr === fmtDate(addDays(new Date(), -1))) return '昨天'
  if (dateStr === fmtDate(addDays(new Date(), 1))) return '明天'
  return formatCN(dateStr)
}

// ---------- 时间工具 HH:mm ----------
export function timeToMin(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

export function minToHHMM(min: number): string {
  const h = Math.floor(min / 60) % 24
  const m = min % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function addTime(t: string, add: number): string {
  return minToHHMM(timeToMin(t) + add)
}

/** 该日是否工作日（默认周一至周五） */
export function isWorkDay(dateStr: string, workDays: number[] = [1, 2, 3, 4, 5]): boolean {
  return workDays.includes(getWeekDay(dateStr))
}

/** 计算日期差（b - a 的天数） */
export function diffDays(a: string, b: string): number {
  const da = new Date(`${a}T00:00:00`).getTime()
  const db = new Date(`${b}T00:00:00`).getTime()
  return Math.round((db - da) / 86400000)
}
