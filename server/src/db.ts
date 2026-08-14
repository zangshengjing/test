// ============================================================
// 数据层：sql.js（纯 WASM SQLite，无原生模块）
// - 提供与 better-sqlite3 兼容的 db.prepare().get/all/run API，
//   使全部路由 / 引擎代码无需改动
// - 持久化双模式：
//     GROWTH_STORE=blob  → EdgeOne Pages Blob 存储（生产部署）
//     GROWTH_STORE=file  → 本地 JSON 文件（本地开发，默认）
// - 内存中维护最新数据库，写操作防抖合并后整体导出持久化
// ============================================================
import initSqlJs from 'sql.js'
import type { Database as SqlDatabase, SqlJsStatic } from 'sql.js'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

// ---------------- 存储模式 ----------------
const STORE_MODE = process.env.GROWTH_STORE === 'blob' ? 'blob' : 'file'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const LOCAL_DB_PATH = path.join(__dirname, '..', 'data', 'growth.db')
const BLOB_KEY = 'data/growth.db'

// Blob store 懒加载（仅 blob 模式使用）
let blobStore: any = null
function getBlobStore() {
  if (!blobStore) {
    // 动态 import，避免本地文件模式加载 SDK
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getStore } = require('@edgeone/pages-blob')
    blobStore = getStore({ name: 'growth', consistency: 'strong' })
  }
  return blobStore
}

// ---------------- sql.js 初始化 ----------------
let SQL: SqlJsStatic | null = null
async function initSql() {
  if (SQL) return SQL
  let wasmPath: string
  try {
    wasmPath = require.resolve('sql.js/dist/sql-wasm.wasm')
  } catch {
    wasmPath = path.join(__dirname, '..', 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm')
  }
  SQL = await initSqlJs({ locateFile: () => wasmPath })
  return SQL
}

// ---------------- 内存 DB 管理 ----------------
let _db: SqlDatabase | null = null
let loadPromise: Promise<SqlDatabase> | null = null

/** 从存储加载数据库（仅一次），未持久化过则创建空库 */
async function loadDb(): Promise<SqlDatabase> {
  const sql = await initSql()
  let bytes: Uint8Array | null = null
  try {
    if (STORE_MODE === 'blob') {
      const raw = await getBlobStore().get(BLOB_KEY, { type: 'arrayBuffer' })
      if (raw) bytes = new Uint8Array(raw)
    } else if (fs.existsSync(LOCAL_DB_PATH)) {
      bytes = new Uint8Array(fs.readFileSync(LOCAL_DB_PATH))
    }
  } catch (e) {
    console.error('[growth-db] 读取持久化数据失败，将新建空库', e)
  }
  const db = bytes && bytes.byteLength > 0 ? new sql.Database(bytes) : new sql.Database()
  _db = db
  db.exec(SCHEMA_SQL)
  runMigrations(db)
  return db
}

/** 确保数据库已就绪（Express 中间件在每个请求前 await 此函数） */
export function ensureDb(): Promise<SqlDatabase> {
  if (!loadPromise) loadPromise = loadDb()
  return loadPromise
}

function currentDb(): SqlDatabase {
  if (!_db) throw new Error('[growth-db] 数据库尚未初始化')
  return _db
}

// ---------------- 持久化（写操作防抖合并 + 串行队列） ----------------
let txDepth = 0
let dirty = false
let persistTimer: ReturnType<typeof setTimeout> | null = null
let persistChain: Promise<void> = Promise.resolve()

function schedulePersist() {
  if (txDepth > 0) return // 事务内不持久化，COMMIT 后统一处理
  dirty = true
  if (persistTimer) return
  persistTimer = setTimeout(() => {
    persistTimer = null
    if (!dirty) return
    dirty = false
    persistChain = persistChain.then(async () => {
      try {
        const bytes = currentDb().export()
        if (STORE_MODE === 'blob') {
          // Blob SDK 要求 ArrayBuffer；Uint8Array 可能有 byteOffset，取干净切片
          const ab = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
          await getBlobStore().set(BLOB_KEY, ab)
        } else {
          fs.mkdirSync(path.dirname(LOCAL_DB_PATH), { recursive: true })
          fs.writeFileSync(LOCAL_DB_PATH, Buffer.from(bytes))
        }
      } catch (e) {
        console.error('[growth-db] 持久化失败', e)
      }
    })
  }, 120)
}

// ---------------- SQL 兼容层 ----------------

/**
 * 命名参数归一化：把 SQL 中的 @name 统一替换为 ?NNN，
 * 并按编号从参数对象取值，彻底规避 sql.js 命名参数前缀差异。
 * 例如：VALUES (@id, @title) + {id:1,title:'x'} → VALUES (?1, ?2) + [1,'x']
 */
function normalizeParams(sql: string, params: any): { sql2: string; args: any[]; anyBind: boolean } {
  if (params === undefined || params === null) return { sql2: sql, args: [], anyBind: false }
  if (Array.isArray(params)) return { sql2: sql, args: params, anyBind: true }
  if (typeof params === 'object') {
    // 命名参数对象：@name → ?NNN，按编号取值
    const seen = new Map<string, number>()
    const order: string[] = []
    const sql2 = sql.replace(/@(\w+)/g, (_, n: string) => {
      if (!seen.has(n)) {
        seen.set(n, order.length + 1)
        order.push(n)
      }
      return '?' + seen.get(n)
    })
    return { sql2, args: order.map((n) => params[n]), anyBind: true }
  }
  // 标量（string/number/boolean/null）→ 单个位置参数
  return { sql2: sql, args: [params], anyBind: true }
}

function getLastInsertRowid(db: SqlDatabase): number {
  try {
    const res = db.exec('SELECT last_insert_rowid() AS id')
    const v = res?.[0]?.values?.[0]?.[0]
    return typeof v === 'number' ? v : Number(v ?? 0)
  } catch {
    return 0
  }
}

/** 兼容 better-sqlite3 的 prepare().get/all/run */
function prepareCompat(sql: string) {
  return {
    get(...bind: any[]) {
      const db = currentDb()
      const { sql2, args, anyBind } = normalizeParams(sql, bind.length <= 1 ? bind[0] : bind)
      const stmt = db.prepare(sql2)
      try {
        if (anyBind) stmt.bind(args)
        const row = stmt.step() ? stmt.getAsObject() : undefined
        return row
      } finally {
        stmt.free()
      }
    },
    all(...bind: any[]) {
      const db = currentDb()
      const { sql2, args, anyBind } = normalizeParams(sql, bind.length <= 1 ? bind[0] : bind)
      const stmt = db.prepare(sql2)
      try {
        if (anyBind) stmt.bind(args)
        const rows: any[] = []
        while (stmt.step()) rows.push(stmt.getAsObject())
        return rows
      } finally {
        stmt.free()
      }
    },
    run(...bind: any[]) {
      const db = currentDb()
      const { sql2, args, anyBind } = normalizeParams(sql, bind.length <= 1 ? bind[0] : bind)
      const stmt = db.prepare(sql2)
      try {
        if (anyBind) stmt.bind(args)
        stmt.step()
        const changes = db.getRowsModified()
        const lastInsertRowid = getLastInsertRowid(db)
        schedulePersist()
        return { changes, lastInsertRowid }
      } finally {
        stmt.free()
      }
    },
  }
}

// ---------------- 导出的 db 对象（接口兼容 better-sqlite3） ----------------
export const db = {
  prepare: prepareCompat,
  exec(sql: string) {
    currentDb().exec(sql)
  },
  pragma(statement: string) {
    try {
      currentDb().exec(`PRAGMA ${statement}`)
    } catch {
      // WAL 等在内存库不可用，静默忽略
    }
  },
  transaction(fn: (...args: any[]) => any) {
    return (...args: any[]) => {
      const inner = currentDb()
      inner.exec('BEGIN')
      txDepth++
      try {
        const result = fn(...args)
        txDepth--
        inner.exec('COMMIT')
        schedulePersist()
        return result
      } catch (e) {
        txDepth--
        try {
          inner.exec('ROLLBACK')
        } catch {
          // ignore
        }
        throw e
      }
    }
  },
}

// ---------------- 建表 ----------------
const SCHEMA_SQL = `
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
`

// ---------------- 轻量迁移：为旧库补充新列 ----------------
function ensureColumn(database: SqlDatabase, table: string, column: string, ddl: string) {
  try {
    const cols = (database.exec(`PRAGMA table_info(${table})`)?.[0]?.values ?? []).map((r: any[]) => r[1])
    if (!cols.includes(column)) {
      database.exec(`ALTER TABLE ${table} ADD COLUMN ${ddl}`)
    }
  } catch (e) {
    console.warn(`[growth-db] 迁移 ${table}.${column} 失败`, e)
  }
}

function runMigrations(database: SqlDatabase) {
  ensureColumn(database, 'content_library', 'views', 'views INTEGER NOT NULL DEFAULT 0')
  ensureColumn(database, 'content_library', 'published_at', 'published_at TEXT')
  ensureColumn(database, 'content_library', 'link', 'link TEXT')
}

// ---------------- 行对象映射工具（供各路由使用） ----------------
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
