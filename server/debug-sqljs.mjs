import initSqlJs from 'sql.js'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const SQL = await initSqlJs({ locateFile: () => require.resolve('sql.js/dist/sql-wasm.wasm') })

const db = new SQL.Database()
db.exec(`CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL,
  template_id TEXT,
  target_days INTEGER NOT NULL DEFAULT 90,
  status TEXT NOT NULL DEFAULT 'active',
  weekly_days TEXT NOT NULL DEFAULT '[1,2,3,4,5,6,0]'
);`)

// 模拟兼容层的 normalize + bind + step
const sql = `INSERT INTO goals (id, title, description, category, template_id, target_days, status, weekly_days)
     VALUES (@id, @title, @description, @category, @templateId, @targetDays, 'active', @weeklyDays)`
const params = {
  id: 'goal-test-1',
  title: '测试目标',
  description: '',
  category: 'study',
  templateId: null,
  targetDays: 90,
  weeklyDays: '[1,2,3,4,5,6,0]',
}

// 归一化
const seen = new Map()
const order = []
const sql2 = sql.replace(/@(\w+)/g, (_, n) => {
  if (!seen.has(n)) { seen.set(n, order.length + 1); order.push(n) }
  return '?' + seen.get(n)
})
const args = order.map((n) => params[n])
console.log('sql2:', sql2)
console.log('args:', JSON.stringify(args))
console.log('order:', order)

const stmt = db.prepare(sql2)
stmt.bind(args)
console.log('step result:', stmt.step())
stmt.free()

console.log('getRowsModified:', db.getRowsModified())
console.log('last_insert_rowid:', db.exec('SELECT last_insert_rowid() AS id')[0].values)

const row = db.prepare('SELECT * FROM goals WHERE id = ?')
row.bind(['goal-test-1'])
const got = row.step() ? row.getAsObject() : undefined
row.free()
console.log('row after insert:', got)
