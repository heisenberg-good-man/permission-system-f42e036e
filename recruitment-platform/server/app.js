const express = require('express')
const cors = require('cors')

const app = express()
const PORT = 3000

app.use(cors())
app.use(express.json())

const jobsRouter = require('./src/routes/jobs')
const applicationsRouter = require('./src/routes/applications')
const messagesRouter = require('./src/routes/messages')
const statisticsRouter = require('./src/routes/statistics')
const interviewsRouter = require('./src/routes/interviews')

app.use('/api/jobs', jobsRouter)
app.use('/api/applications', applicationsRouter)
app.use('/api/messages', messagesRouter)
app.use('/api/statistics', statisticsRouter)
app.use('/api/interviews', interviewsRouter)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
