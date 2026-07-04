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
  pending: '待筛选',
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

  // 手机号格式校验
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(String(phone).trim())) {
    return res.json({
      code: 400,
      message: '手机号格式不正确，请输入 11 位有效手机号'
    })
  }

  // 邮箱格式校验
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(String(email).trim())) {
    return res.json({
      code: 400,
      message: '邮箱格式不正确，请输入有效邮箱地址'
    })
  }

  const job = jobs.find(j => j.id === parseInt(req.body.jobId))
  if (!job) {
    return res.json({ code: 404, message: '职位不存在' })
  }

  // 职位已关闭，不能投递
  if (job.status === 'closed') {
    return res.json({ code: 403, message: '该职位已关闭，暂不接受新的投递' })
  }

  // 重复投递校验：同一手机号不能重复投递同一职位（终态后 30 天内也不能重复投递）
  const trimmedPhone = String(phone).trim()
  const existingApplication = applications.find(
    a => a.jobId === parseInt(jobId) && a.phone === trimmedPhone
  )
  if (existingApplication) {
    // 只有终态（rejected/offered）且投递时间超过 30 天才能重新投递，这里简化为一律提示已投递
    return res.json({
      code: 409,
      message: '您已投递过该职位，请勿重复投递',
      data: { applicationId: existingApplication.id }
    })
  }

  const now = new Date().toISOString()
  const newApplication = {
    id: getNextApplicationId(),
    ...req.body,
    candidateName: candidateName.trim(),
    phone: trimmedPhone,
    email: email.trim(),
    jobTitle: job.title,
    source: req.body.source || '官网投递',
    owner: req.body.owner || '李HR',
    notes: req.body.notes || '',
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
  const { status, keyword, source, page = 1, size = 10 } = req.query
  const jobId = parseInt(req.params.jobId)
  
  let filtered = applications.filter(a => a.jobId === jobId)
  
  if (status) {
    filtered = filtered.filter(a => a.status === status)
  }
  
  if (source) {
    filtered = filtered.filter(a => a.source === source)
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
  const { status, keyword, jobId, source, page = 1, size = 10 } = req.query
  
  let filtered = [...applications]
  
  if (status) {
    filtered = filtered.filter(a => a.status === status)
  }
  
  if (source) {
    filtered = filtered.filter(a => a.source === source)
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

const STATUS_FLOW = {
  pending: ['contacted', 'rejected'],
  contacted: ['interviewing', 'rejected'],
  interviewing: ['offered', 'rejected'],
  offered: [],
  rejected: []
}

const TERMINAL_STATUSES = ['offered', 'rejected']

const isForwardTransition = (from, to) => {
  if (from === to) return false
  const allowed = STATUS_FLOW[from] || []
  return allowed.includes(to)
}

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

    // 状态相同无需变更
    if (previousStatus === status) {
      return res.json({ code: 400, message: '当前状态与目标状态一致，无需变更' })
    }

    // 终态不可变更
    if (TERMINAL_STATUSES.includes(previousStatus)) {
      return res.json({
        code: 403,
        message: `当前状态为「${STATUS_LABELS[previousStatus] || previousStatus}」，为终态不可再次变更`
      })
    }

    // 状态流转校验：不允许回退
    if (!isForwardTransition(previousStatus, status)) {
      return res.json({
        code: 403,
        message: `状态不能从「${STATUS_LABELS[previousStatus] || previousStatus}」回退到「${STATUS_LABELS[status] || status}」`
      })
    }

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

router.put('/:id/notes', (req, res) => {
  const { notes } = req.body
  const index = applications.findIndex(a => a.id === parseInt(req.params.id))
  if (index !== -1) {
    applications[index].notes = notes || ''
    applications[index].updatedAt = new Date().toISOString()
    res.json({ code: 200, data: { notes: applications[index].notes } })
  } else {
    res.json({ code: 404, message: '投递记录不存在' })
  }
})

router.put('/:id/owner', (req, res) => {
  const { owner } = req.body
  if (!owner || !owner.trim()) {
    return res.json({ code: 400, message: '负责人不能为空' })
  }
  const index = applications.findIndex(a => a.id === parseInt(req.params.id))
  if (index !== -1) {
    applications[index].owner = owner.trim()
    applications[index].updatedAt = new Date().toISOString()
    res.json({ code: 200, data: { owner: applications[index].owner } })
  } else {
    res.json({ code: 404, message: '投递记录不存在' })
  }
})

module.exports = router
