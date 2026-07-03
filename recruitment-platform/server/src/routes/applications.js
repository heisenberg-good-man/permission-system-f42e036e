const express = require('express')
const router = express.Router()
const { applications, getNextApplicationId, jobs } = require('../data/mockData')

const getStatusAction = (status) => {
  const map = {
    pending: '投递简历',
    contacted: '已沟通',
    interviewing: '面试中',
    rejected: '已拒绝'
  }
  return map[status] || status
}

router.post('/', (req, res) => {
  const job = jobs.find(j => j.id === parseInt(req.body.jobId))
  if (!job) {
    return res.json({ code: 404, message: '职位不存在' })
  }
  
  const now = new Date().toISOString()
  const newApplication = {
    id: getNextApplicationId(),
    ...req.body,
    jobTitle: job.title,
    status: 'pending',
    createdAt: now,
    timeline: [{ status: 'pending', action: '投递简历', time: now }]
  }
  applications.push(newApplication)
  res.json({ code: 200, data: newApplication })
})

router.get('/job/:jobId', (req, res) => {
  const { status, keyword, page = 1, size = 10 } = req.query
  const jobId = parseInt(req.params.jobId)
  
  let filtered = applications.filter(a => a.jobId === jobId)
  
  if (status) {
    filtered = filtered.filter(a => a.status === status)
  }
  
  if (keyword) {
    filtered = filtered.filter(a => 
      a.candidateName.includes(keyword) || 
      a.phone.includes(keyword) || 
      a.email.includes(keyword) ||
      a.skills.includes(keyword)
    )
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

router.get('/', (req, res) => {
  const { status, keyword, jobId, page = 1, size = 10 } = req.query
  
  let filtered = [...applications]
  
  if (status) {
    filtered = filtered.filter(a => a.status === status)
  }
  
  if (keyword) {
    filtered = filtered.filter(a => 
      a.candidateName.includes(keyword) || 
      a.phone.includes(keyword) || 
      a.email.includes(keyword) ||
      a.skills.includes(keyword) ||
      a.jobTitle.includes(keyword)
    )
  }
  
  if (jobId) {
    filtered = filtered.filter(a => a.jobId === parseInt(jobId))
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
    if (!applications[index].timeline) {
      applications[index].timeline = []
    }
    applications[index].status = status
    applications[index].timeline.push({
      status: status,
      action: getStatusAction(status),
      time: new Date().toISOString()
    })
    res.json({ code: 200, data: { id: applications[index].id, status } })
  } else {
    res.json({ code: 404, message: '投递记录不存在' })
  }
})

module.exports = router
