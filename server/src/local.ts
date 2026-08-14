// 本地开发 / 独立运行入口：监听端口启动 Express app
import app from './index'

const PORT = Number(process.env.PORT) || 3001
app.listen(PORT, () => {
  console.log(`[growth-server] API 已启动: http://localhost:${PORT}/api/v1`)
})
