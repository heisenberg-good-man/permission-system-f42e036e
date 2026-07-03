const express = require('express')
const router = express.Router()
const { applications, getNextApplicationId, jobs, notifications, getNextNotificationId } = require('../data/mockData')

const getStatusAction = (status) => {
  const map = {
    pending: '投递简历',
    contacted: '已沟通',
    interviewing: '面试中',
    offered: '发 Offer',
    rejected: '已淘汰'
  }
  return map[status] || status
}

const STATUS_LABELS = {
  contacted: '已沟通',
  interviewing: '面试中',
  offered: '已发 Offer',
  rejected: '已淘汰'
}

const pushNotification = (payload) => {
  const now = new Date().toISOString()
  notifications.push({
    id: getNextNotificationId(),
    isRead: false,
    isIgnored: false,
    triggerTime: now,
    createdAt: now,
    ...payload
  })
}

router.post('/', (req, res) => {
  const { jobId, candidateName, phone, email } = req.body
  const missingFields = []

  if (!jobId) missingFields.push('职位ID')
  if (!candidateName || !candidateName.trim()) missingFields.push('姓名')
  if (!phone || !phone.trim()) missingFields.push('电话')
  if (!email || !email.trim()) missingFields.push('邮箱')

  if (missingFields.length > 0) {
    return res.json({
      code: 400,
      message: `以下字段为必填项：${missingFields.join('、')}`
    })
  }

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

  // 联动：招聘方收到新投递提醒
  pushNotification({
    role: 'recruiter',
    type: 'new_application',
    title: '新投递提醒',
    content: `${newApplication.candidateName} 投递了「${newApplication.jobTitle}」职位，请及时筛选。`,
    priority: 'normal',
    relatedType: 'application',
    relatedId: newApplication.id,
    linkUrl: `/application/${newApplication.id}`
  })

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
  const validStatuses = ['pending', 'contacted', 'interviewing', 'offered', 'rejected']

  if (!validStatuses.includes(status)) {
    return res.json({ code: 400, message: '无效的状态值' })
  }

  const index = applications.findIndex(a => a.id === parseInt(req.params.id))
  if (index !== -1) {
    const application = applications[index]
    const previousStatus = application.status
    if (!application.timeline) {
      application.timeline = []
    }
    application.status = status
    application.timeline.push({
      status: status,
      action: getStatusAction(status),
      time: new Date().toISOString()
    })

    // 联动：状态变化时通知候选人（排除 pending 投递初始态）
    if (previousStatus !== status && STATUS_LABELS[status]) {
      pushNotification({
        role: 'candidate',
        type: 'status_change',
        title: '投递状态变更',
        content: `您投递的「${application.jobTitle}」状态已更新为：${STATUS_LABELS[status]}。`,
        priority: status === 'offered' ? 'high' : 'normal',
        relatedType: 'application',
        relatedId: application.id,
        linkUrl: `/application/${application.id}`
      })
    }

    // 返回完整 application（含 timeline），便于前端直接刷新时间线与终态联动
    res.json({ code: 200, data: application })
  } else {
    res.json({ code: 404, message: '投递记录不存在' })
  }
})

module.exports = router
