const express = require('express')
const router = express.Router()
const {
  notifications,
  applications,
  interviews,
  jobs,
  hiringRequests,
  getNextNotificationId
} = require('../data/mockData')

const VALID_ROLES = ['recruiter', 'candidate', 'interviewer', 'hiring_manager']
const VALID_TYPES = [
  'new_application',
  'status_change',
  'interview_scheduled',
  'interview_rescheduled',
  'feedback_pending',
  'feedback_submitted',
  'offer_pending',
  'hiring_request_result'
]
const VALID_PRIORITIES = ['low', 'normal', 'high']

// 校验关联对象是否存在（用于点击跳转前判断目标是否还在）
const RELATED_RESOLVERS = {
  application: (id) => applications.find(a => a.id === parseInt(id)),
  interview: (id) => interviews.find(i => i.id === parseInt(id)),
  job: (id) => jobs.find(j => j.id === parseInt(id)),
  hiring_request: (id) => hiringRequests.find(r => r.id === parseInt(id)),
  offer: (id) => applications.find(a => a.id === parseInt(id) && a.status === 'offered')
}

const decorate = (n) => {
  if (!n) return n
  const resolver = RELATED_RESOLVERS[n.relatedType]
  const targetExists = resolver ? !!resolver(n.relatedId) : true
  return { ...n, targetExists }
}

// 列表：按角色/类型/已读/关键词筛选 + 分页（默认排除已忽略）
router.get('/', (req, res) => {
  const {
    role,
    type,
    isRead,
    priority,
    keyword,
    includeIgnored = 'false',
    page = 1,
    size = 10
  } = req.query

  let filtered = [...notifications]

  if (includeIgnored !== 'true') {
    filtered = filtered.filter(n => !n.isIgnored)
  }

  if (role) {
    if (!VALID_ROLES.includes(role)) {
      return res.json({ code: 400, message: '无效的角色类型' })
    }
    filtered = filtered.filter(n => n.role === role)
  }
  if (type) {
    if (!VALID_TYPES.includes(type)) {
      return res.json({ code: 400, message: '无效的提醒类型' })
    }
    filtered = filtered.filter(n => n.type === type)
  }
  if (priority) {
    if (!VALID_PRIORITIES.includes(priority)) {
      return res.json({ code: 400, message: '无效的优先级' })
    }
    filtered = filtered.filter(n => n.priority === priority)
  }
  if (isRead !== undefined && isRead !== '') {
    const readFlag = isRead === 'true'
    filtered = filtered.filter(n => n.isRead === readFlag)
  }
  if (keyword) {
    const kw = String(keyword).trim()
    filtered = filtered.filter(n =>
      n.title.includes(kw) || n.content.includes(kw)
    )
  }

  filtered.sort((a, b) => new Date(b.triggerTime) - new Date(a.triggerTime))

  const total = filtered.length
  const start = (parseInt(page) - 1) * parseInt(size)
  const list = filtered.slice(start, start + parseInt(size)).map(decorate)

  res.json({
    code: 200,
    data: { list, total, page: parseInt(page), size: parseInt(size) }
  })
})

// 未读数（可按角色过滤，用于顶部徽章 + 工作台统计）
router.get('/unread-count', (req, res) => {
  const { role } = req.query
  let list = notifications.filter(n => !n.isRead && !n.isIgnored)
  if (role) {
    if (!VALID_ROLES.includes(role)) {
      return res.json({ code: 400, message: '无效的角色类型' })
    }
    list = list.filter(n => n.role === role)
  }
  res.json({ code: 200, data: { count: list.length } })
})

// 各类型未读分布（工作台可按类型展示）
router.get('/summary', (req, res) => {
  const { role } = req.query
  let list = notifications.filter(n => !n.isIgnored)
  if (role) {
    list = list.filter(n => n.role === role)
  }
  const unread = list.filter(n => !n.isRead)
  const byType = {}
  VALID_TYPES.forEach(t => { byType[t] = 0 })
  unread.forEach(n => { byType[n.type] = (byType[n.type] || 0) + 1 })
  res.json({
    code: 200,
    data: {
      total: list.length,
      unreadCount: unread.length,
      readCount: list.length - unread.length,
      byType
    }
  })
})

// 详情
router.get('/:id', (req, res) => {
  const item = notifications.find(n => n.id === parseInt(req.params.id))
  if (!item) {
    return res.json({ code: 404, message: '提醒不存在' })
  }
  res.json({ code: 200, data: decorate(item) })
})

// 单条标记已读
router.put('/:id/read', (req, res) => {
  const item = notifications.find(n => n.id === parseInt(req.params.id))
  if (!item) {
    return res.json({ code: 404, message: '提醒不存在' })
  }
  if (item.isRead) {
    return res.json({ code: 200, data: decorate(item), message: '该提醒已是已读状态，无需重复操作' })
  }
  item.isRead = true
  res.json({ code: 200, data: decorate(item), message: '已标记为已读' })
})

// 全部标记已读（可按角色）
router.put('/read-all', (req, res) => {
  const { role } = req.body
  let targets = notifications.filter(n => !n.isRead && !n.isIgnored)
  if (role) {
    if (!VALID_ROLES.includes(role)) {
      return res.json({ code: 400, message: '无效的角色类型' })
    }
    targets = targets.filter(n => n.role === role)
  }
  let count = 0
  targets.forEach(n => {
    n.isRead = true
    count++
  })
  if (count === 0) {
    return res.json({ code: 200, data: { count: 0 }, message: '没有需要标记的未读提醒' })
  }
  res.json({ code: 200, data: { count }, message: `已将 ${count} 条提醒标记为已读` })
})

// 忽略提醒（不再出现在默认列表与未读数中）
router.put('/:id/ignore', (req, res) => {
  const item = notifications.find(n => n.id === parseInt(req.params.id))
  if (!item) {
    return res.json({ code: 404, message: '提醒不存在' })
  }
  if (item.isIgnored) {
    return res.json({ code: 200, data: decorate(item), message: '该提醒已被忽略，无需重复操作' })
  }
  item.isIgnored = true
  item.isRead = true
  res.json({ code: 200, data: decorate(item), message: '已忽略该提醒' })
})

module.exports = router
