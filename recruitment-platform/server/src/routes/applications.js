const express = require('express')
const router = express.Router()
const { applications, getNextApplicationId, jobs } = require('../data/mockData')

router.post('/', (req, res) => {
  const job = jobs.find(j => j.id === parseInt(req.body.jobId))
  if (!job) {
    return res.json({ code: 404, message: '职位不存在' })
  }
  
  const newApplication = {
    id: getNextApplicationId(),
    ...req.body,
    jobTitle: job.title,
    status: 'pending',
    createdAt: new Date().toISOString()
  }
  applications.push(newApplication)
  res.json({ code: 200, data: newApplication })
})

router.get('/job/:jobId', (req, res) => {
  const { status, page = 1, size = 10 } = req.query
  const jobId = parseInt(req.params.jobId)
  
  let filtered = applications.filter(a => a.jobId === jobId)
  
  if (status) {
    filtered = filtered.filter(a => a.status === status)
  }
  
  const start = (page - 1) * size
  const end = start + parseInt(size)
  const paginated = filtered.slice(start, end)
  
  res.json({
    code: 200,
    data: {
      list: paginated,
      total: filtered.length,
      page: parseInt(page),
      size: parseInt(size)
    }
  })
})

router.get('/:id', (req, res) => {
  const application = applications.find(a => a.id === parseInt(req.params.id))
  if (application) {
    res.json({ code: 200, data: application })
  } else {
    res.json({ code: 404, message: '投递记录不存在' })
  }
})

router.put('/:id/status', (req, res) => {
  const { status } = req.body
  const validStatuses = ['pending', 'contacted', 'interviewing', 'rejected']
  
  if (!validStatuses.includes(status)) {
    return res.json({ code: 400, message: '无效的状态值' })
  }
  
  const index = applications.findIndex(a => a.id === parseInt(req.params.id))
  if (index !== -1) {
    applications[index].status = status
    res.json({ code: 200, data: { id: applications[index].id, status } })
  } else {
    res.json({ code: 404, message: '投递记录不存在' })
  }
})

module.exports = router
