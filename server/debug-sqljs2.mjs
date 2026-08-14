// 集成测试：模拟 goals.ts 的 POST 流程
import { db, ensureDb, rowToGoal } from './src/db.ts'

await ensureDb()

const id = 'goal-test-' + Date.now()
db.prepare(
  `INSERT INTO goals (id, title, description, category, template_id, target_days, status, weekly_days)
   VALUES (@id, @title, @description, @category, @templateId, @targetDays, 'active', @weeklyDays)`
).run({
  id,
  title: '测试目标',
  description: '',
  category: 'study',
  templateId: null,
  targetDays: 90,
  weeklyDays: JSON.stringify([1, 2, 3, 4, 5, 6, 0]),
})

const row = db.prepare('SELECT * FROM goals WHERE id = ?').get(id)
console.log('row:', row)
console.log('rowToGoal:', rowToGoal(row))

// 测试标量位置参数
const r2 = db.prepare('SELECT COUNT(*) AS c FROM goals WHERE category = ?').get('study')
console.log('count by scalar:', r2)

// 测试事务
const txn = db.transaction(() => {
  db.prepare("INSERT INTO goals (id, title, category, status) VALUES (@id, @title, @category, 'active')").run({
    id: 'goal-txn-' + Date.now(),
    title: '事务目标',
    category: 'fitness',
  })
})
txn()
const r3 = db.prepare("SELECT COUNT(*) AS c FROM goals WHERE category = 'fitness'").get()
console.log('txn count:', r3)

process.exit(0)
