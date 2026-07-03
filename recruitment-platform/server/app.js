const express = require('express')
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ code: 200, data: { status: 'ok', timestamp: new Date().toISOString() } })
})

const jobsRouter = require('./src/routes/jobs')
const applicationsRouter = require('./src/routes/applications')
const messagesRouter = require('./src/routes/messages')
const statisticsRouter = require('./src/routes/statistics')
const interviewsRouter = require('./src/routes/interviews')
const hiringRequestsRouter = require('./src/routes/hiringRequests')
const notificationsRouter = require('./src/routes/notifications')

app.use('/api/jobs', jobsRouter)
app.use('/api/applications', applicationsRouter)
app.use('/api/messages', messagesRouter)
app.use('/api/statistics', statisticsRouter)
app.use('/api/interviews', interviewsRouter)
app.use('/api/hiring-requests', hiringRequestsRouter)
app.use('/api/notifications', notificationsRouter)

app.use((err, req, res, next) => {
  console.error('Server error:', err)
  res.status(500).json({ code: 500, message: '服务器内部错误' })
})

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/api/health`)
})

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`端口 ${PORT} 已被占用，请先关闭占用进程或修改 PORT 环境变量`)
    process.exit(1)
  } else {
    console.error('服务器启动失败:', err)
  }
})
