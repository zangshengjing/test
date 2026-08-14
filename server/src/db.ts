import Database from 'better-sqlite3'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(__dirname, '..', 'data')
fs.mkdirSync(dataDir, { recursive: true })

export const db = new Database(path.join(dataDir, 'growth.db'))
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// ---------------- 建表 ----------------
db.exec(`
CREATE TABLE IF NOT EXISTS profile (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  name TEXT NOT NULL DEFAULT '',
  onboarded INTEGER NOT NULL DEFAULT 0,
  wake_time TEXT NOT NULL DEFAULT '06:30',
  sleep_time TEXT NOT NULL DEFAULT '23:00',
  work_start TEXT NOT NULL DEFAULT '09:00',
  work_end TEXT NOT NULL DEFAULT '18:30',
  commute_min INTEGER NOT NULL DEFAULT 30,
  work_days TEXT NOT NULL DEFAULT '[1,2,3,4,5]',
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL,
  template_id TEXT,
  target_days INTEGER NOT NULL DEFAULT 90,
  status TEXT NOT NULL DEFAULT 'active',
  weekly_days TEXT NOT NULL DEFAULT '[1,2,3,4,5,6,0]',
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  goal_id TEXT,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'auto',
  date TEXT NOT NULL,
  content_id TEXT,
  duration_min INTEGER NOT NULL DEFAULT 30,
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_tasks_date ON tasks(date);
CREATE INDEX IF NOT EXISTS idx_tasks_goal ON tasks(goal_id);

CREATE TABLE IF NOT EXISTS timeblocks (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  start TEXT NOT NULL,
  end TEXT NOT NULL,
  title TEXT NOT NULL,
  kind TEXT NOT NULL,
  task_id TEXT,
  locked INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_timeblocks_date ON timeblocks(date);

CREATE TABLE IF NOT EXISTS checkins (
  date TEXT NOT NULL,
  task_id TEXT NOT NULL,
  completed INTEGER NOT NULL DEFAULT 0,
  completed_at TEXT,
  duration_min INTEGER,
  PRIMARY KEY (date, task_id)
);
CREATE INDEX IF NOT EXISTS idx_checkins_date ON checkins(date);

CREATE TABLE IF NOT EXISTS assessments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  scores TEXT NOT NULL,
  answers TEXT NOT NULL,
  suggestions TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_assessments_date ON assessments(date);

CREATE TABLE IF NOT EXISTS content_assignments (
  date TEXT PRIMARY KEY,
  content_id TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_assignments_content ON content_assignments(content_id);

CREATE TABLE IF NOT EXISTS content_library (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  duration_min INTEGER NOT NULL DEFAULT 20,
  text_body TEXT,
  video_url TEXT,
  embed_url TEXT,
  link TEXT,
  origin TEXT NOT NULL DEFAULT 'builtin',
  views INTEGER NOT NULL DEFAULT 0,
  published_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
`)

// ---------------- 轻量迁移：为旧库补充新列 ----------------
function ensureColumn(table: string, column: string, ddl: string) {
  const cols = (db.prepare(`PRAGMA table_info(${table})`).all() as any[]).map((c) => c.name)
  if (!cols.includes(column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${ddl}`)
  }
}
ensureColumn('content_library', 'views', 'views INTEGER NOT NULL DEFAULT 0')
ensureColumn('content_library', 'published_at', 'published_at TEXT')
ensureColumn('content_library', 'link', 'link TEXT')

// ---------------- 行对象映射工具 ----------------
export function rowToProfile(row: any) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    onboarded: !!row.onboarded,
    wakeTime: row.wake_time,
    sleepTime: row.sleep_time,
    workStart: row.work_start,
    workEnd: row.work_end,
    commuteMin: row.commute_min,
    workDays: JSON.parse(row.work_days),
    createdAt: row.created_at,
  }
}

export function rowToGoal(row: any) {
  if (!row) return null
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    templateId: row.template_id ?? undefined,
    targetDays: row.target_days,
    status: row.status,
    weeklyDays: JSON.parse(row.weekly_days),
    createdAt: row.created_at,
  }
}

export function rowToTask(row: any) {
  if (!row) return null
  return {
    id: row.id,
    goalId: row.goal_id ?? null,
    title: row.title,
    category: row.category,
    source: row.source,
    date: row.date,
    contentId: row.content_id ?? null,
    durationMin: row.duration_min,
    sortOrder: row.sort_order,
  }
}

export function rowToTimeBlock(row: any) {
  if (!row) return null
  return {
    id: row.id,
    date: row.date,
    start: row.start,
    end: row.end,
    title: row.title,
    kind: row.kind,
    taskId: row.task_id ?? null,
    locked: !!row.locked,
  }
}

export function rowToContent(row: any) {
  if (!row) return null
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    category: row.category,
    summary: row.summary,
    durationMin: row.duration_min,
    textBody: row.text_body ?? undefined,
    videoUrl: row.video_url ?? undefined,
    embedUrl: row.embed_url ?? undefined,
    link: row.link ?? undefined,
    origin: row.origin,
    views: row.views ?? 0,
    publishedAt: row.published_at ?? undefined,
  }
}

export function rowToAssessment(row: any) {
  if (!row) return null
  return {
    id: row.id,
    date: row.date,
    scores: JSON.parse(row.scores),
    answers: JSON.parse(row.answers),
    suggestions: JSON.parse(row.suggestions),
  }
}
