import express from 'express'
import type { NextFunction, Request, Response } from 'express'
import cors from 'cors'
import { seedContentLibrary } from './seed'
import profileRouter from './routes/profile'
import goalsRouter from './routes/goals'
import tasksRouter from './routes/tasks'
import scheduleRouter from './routes/schedule'
import checkinsRouter from './routes/checkins'
import assessmentsRouter from './routes/assessments'
import contentRouter from './routes/content'
import statsRouter from './routes/stats'
import seedRouter from './routes/seed'
import dataRouter from './routes/data'

const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))

// 首次启动 seed 内置内容库（幂等）
seedContentLibrary()

app.use('/api/v1/profile', profileRouter)
app.use('/api/v1/goals', goalsRouter)
app.use('/api/v1/tasks', tasksRouter)
app.use('/api/v1/schedule', scheduleRouter)
app.use('/api/v1/checkins', checkinsRouter)
app.use('/api/v1/assessments', assessmentsRouter)
app.use('/api/v1/content', contentRouter)
app.use('/api/v1/stats', statsRouter)
app.use('/api/v1/seed', seedRouter)
app.use('/api/v1/data', dataRouter)

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() })
})

// 统一错误处理（body-parser 解析失败等 4xx 错误应原样返回，而非 500）
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = Number(err.status ?? err.statusCode ?? 500)
  if (status >= 500) {
    console.error('[growth-server]', err)
  } else {
    console.warn('[growth-server]', status, err.message)
  }
  const message = err.type === 'entity.parse.failed'
    ? '请求体不是合法的 JSON'
    : (err.message ?? '服务器内部错误')
  res.status(status).json({ error: message })
})

const PORT = Number(process.env.PORT) || 3001
app.listen(PORT, () => {
  console.log(`[growth-server] API 已启动: http://localhost:${PORT}/api/v1`)
})
