// ============================================================
// 共享领域类型：前后端共同引用（client / server / shared）
// 日期格式统一为 YYYY-MM-DD，时间格式统一为 HH:mm
// ============================================================

export type TaskSource = 'auto' | 'manual'
export type ContentType = 'text' | 'video'
export type ContentOrigin = 'builtin' | 'custom'

export type TaskCategory = 'study' | 'fitness' | 'finance' | 'family' | 'mind' | 'life'
export type ContentCategory = 'study' | 'finance' | 'mind' | 'family' | 'life'

export type DimensionId =
  | 'body'
  | 'finance'
  | 'skill'
  | 'social'
  | 'mind'
  | 'family'
  | 'spirit'
  | 'life'

export type TimeBlockKind =
  | 'sleep'
  | 'commute'
  | 'work'
  | 'meal'
  | 'study'
  | 'fitness'
  | 'family'
  | 'free'

export type GoalStatus = 'active' | 'paused' | 'done'

// ---------- 用户档案 ----------
export interface Profile {
  id: number
  name: string
  onboarded: boolean
  wakeTime: string // 起床 HH:mm
  sleepTime: string // 睡觉 HH:mm
  workStart: string // 上班 HH:mm
  workEnd: string // 下班 HH:mm
  commuteMin: number // 单程通勤分钟
  workDays: number[] // 工作日 0(周日)~6(周六)
  createdAt: string
}

export interface ProfileInput {
  name: string
  wakeTime: string
  sleepTime: string
  workStart: string
  workEnd: string
  commuteMin: number
  workDays: number[]
}

// ---------- 目标 ----------
export interface Goal {
  id: string
  title: string
  description: string
  category: TaskCategory
  templateId?: string
  targetDays: number
  status: GoalStatus
  weeklyDays: number[] // 每周执行日 0~6
  createdAt: string
}

export interface GoalInput {
  title: string
  description?: string
  category: TaskCategory
  templateId?: string
  targetDays?: number
  weeklyDays?: number[]
}

// ---------- 任务 ----------
export interface Task {
  id: string
  goalId?: string | null
  title: string
  category: TaskCategory
  source: TaskSource
  date: string
  contentId?: string | null
  durationMin: number
  sortOrder: number
}

export interface TaskInput {
  goalId?: string
  title: string
  category: TaskCategory
  contentId?: string
  durationMin?: number
}

// ---------- 学习内容 ----------
export interface LearningContent {
  id: string
  type: ContentType
  title: string
  category: ContentCategory
  summary: string
  durationMin: number
  textBody?: string // type=text 时正文
  videoUrl?: string // type=video 时外链
  embedUrl?: string // type=video 时 iframe 内嵌地址
  link?: string // type=text 时网上资源外链（如微信读书/豆瓣/B 站解读）
  origin: ContentOrigin
  views?: number // 浏览量
  publishedAt?: string // 发布时间 YYYY-MM-DD
}

export interface LearningContentInput {
  type: ContentType
  title: string
  category: ContentCategory
  summary?: string
  durationMin?: number
  textBody?: string
  videoUrl?: string
  embedUrl?: string
  link?: string
}

// ---------- 24 小时时间块 ----------
export interface TimeBlock {
  id: string
  date: string
  start: string
  end: string
  title: string
  kind: TimeBlockKind
  taskId?: string | null
  locked: boolean // 手动修改过的块，重新生成时保留
}

export interface TimeBlockPatch {
  start?: string
  end?: string
  title?: string
  kind?: TimeBlockKind
}

export interface DaySchedule {
  date: string
  blocks: TimeBlock[]
  generated: boolean
}

// ---------- 打卡 ----------
export interface CheckIn {
  date: string
  taskId: string
  completed: boolean
  completedAt?: string | null
  durationMin?: number | null
}

// ---------- 体检 ----------
export interface Assessment {
  id: number
  date: string
  scores: Record<DimensionId, number> // 维度 0-100
  answers: Record<DimensionId, number[]> // 每题原始分
  suggestions: string[] // 改进建议清单
}

export interface AssessmentSubmit {
  answers: Record<DimensionId, number[]>
}

export interface DimensionScore {
  id: DimensionId
  label: string
  score: number // 0-100
  level: 'excellent' | 'good' | 'warning' | 'danger'
  advice: string
}

export interface DimensionMeta {
  id: DimensionId
  label: string
  icon: string
  color: string
  description: string
}

// ---------- 题库 / 模板 ----------
export interface AssessmentQuestion {
  id: string
  dimension: DimensionId
  text: string
  options: { label: string; score: number }[]
}

export interface SkillPath {
  id: string
  title: string
  description: string
  category: TaskCategory
  stages: { name: string; items: string[] }[]
}

export interface GoalTemplate {
  id: string
  title: string
  description: string
  category: TaskCategory
  targetDays: number
  weeklyDays: number[]
  tasks: {
    title: string
    category: TaskCategory
    durationMin: number
    weeklyDays: number[]
  }[]
}

export interface SeedLibrary {
  dimensions: DimensionMeta[]
  questions: AssessmentQuestion[]
  books: LearningContent[]
  courses: LearningContent[]
  skillPaths: SkillPath[]
  goalTemplates: GoalTemplate[]
  library: LearningContent[]
}

// ---------- 统计 ----------
export interface StatsData {
  streakDays: number // 连续打卡天数
  todayCompleted: number
  todayTotal: number
  weekRate: number // 本周完成率 0-100
  monthRate: number
  totalDurationMin: number // 累计学习/锻炼时长
  heatmap: { date: string; count: number }[]
  trend: { date: string; rate: number; score?: number }[]
  dimensionHistory: { date: string; scores: Record<string, number> }[]
}

// ---------- 通用响应 ----------
export interface ApiError {
  error: string
}
