const express = require('express')
const router = express.Router()
const {
  hiringRequests,
  jobs,
  getNextHiringRequestId,
  getNextJobId
} = require('../data/mockData')

const VALID_STATUSES = ['pending', 'approved', 'rejected', 'closed']
const VALID_PRIORITIES = ['low', 'normal', 'urgent']

const validateFields = (body, requireId = false) => {
  const missing = []
  if (requireId && !body.id) missing.push('id')
  if (!body.department || !String(body.department).trim()) missing.push('部门')
  if (!body.position || !String(body.position).trim()) missing.push('岗位名称')
  if (!body.headcount || isNaN(parseInt(body.headcount)) || parseInt(body.headcount) <= 0) missing.push('招聘人数')
  if (!body.level || !String(body.level).trim()) missing.push('级别')
  if (body.priority && !VALID_PRIORITIES.includes(body.priority)) missing.push('优先级')
  if (!body.salaryRange || !String(body.salaryRange).trim()) missing.push('薪资范围')
  if (!body.location || !String(body.location).trim()) missing.push('工作地点')
  if (!body.applicant || !String(body.applicant).trim()) missing.push('申请人')
  return missing
}

const enrich = (req) => {
  if (!req) return req
  const relatedJobs = jobs.filter(j => (req.relatedJobIds || []).includes(j.id))
  return { ...req, relatedJobs }
}

// 列表：筛选 + 分页
router.get('/', (req, res) => {
  const {
    department, position, status, priority, applicant, page = 1, size = 10
  } = req.query

  let filtered = [...hiringRequests]

  if (department) {
    filtered = filtered.filter(r => String(r.department).includes(String(department).trim()))
  }
  if (position) {
    const kw = String(position).trim()
    filtered = filtered.filter(r => r.position.includes(kw) || (r.requestNo || '').includes(kw))
  }
  if (status) {
    filtered = filtered.filter(r => r.status === status)
  }
  if (priority) {
    filtered = filtered.filter(r => r.priority === priority)
  }
  if (applicant) {
    filtered = filtered.filter(r => r.applicant.includes(String(applicant).trim()))
  }

  filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const total = filtered.length
  const start = (parseInt(page) - 1) * parseInt(size)
  const list = filtered.slice(start, start + parseInt(size)).map(enrich)

  res.json({
    code: 200,
    data: { list, total, page: parseInt(page), size: parseInt(size) }
  })
})

// 全部简单列表（供发布职位时下拉选择，只返回 approved 的）
router.get('/simple', (req, res) => {
  const list = hiringRequests
    .filter(r => r.status === 'approved')
    .map(r => ({ id: r.id, requestNo: r.requestNo, position: r.position, department: r.department, headcount: r.headcount, filledCount: r.filledCount }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  res.json({ code: 200, data: list })
})

// 详情
router.get('/:id', (req, res) => {
  const item = hiringRequests.find(r => r.id === parseInt(req.params.id))
  if (!item) {
    return res.json({ code: 404, message: '用人需求不存在' })
  }
  res.json({ code: 200, data: enrich(item) })
})

// 新增
router.post('/', (req, res) => {
  const missing = validateFields(req.body)
  if (missing.length > 0) {
    return res.json({ code: 400, message: `以下字段为必填项：${missing.join('、')}` })
  }

  const now = new Date().toISOString()
  const id = getNextHiringRequestId()
  const newReq = {
    id,
    requestNo: `HR-2024-${String(id).padStart(3, '0')}`,
    department: String(req.body.department).trim(),
    position: String(req.body.position).trim(),
    headcount: parseInt(req.body.headcount),
    level: String(req.body.level).trim(),
    priority: req.body.priority || 'normal',
    salaryRange: String(req.body.salaryRange).trim(),
    location: String(req.body.location).trim(),
    category: req.body.category ? String(req.body.category).trim() : '技术开发',
    reason: req.body.reason ? String(req.body.reason).trim() : '',
    requirements: req.body.requirements ? String(req.body.requirements).trim() : '',
    applicant: String(req.body.applicant).trim(),
    status: req.body.status || 'pending',
    filledCount: 0,
    relatedJobIds: [],
    createdAt: now,
    updatedAt: now
  }
  hiringRequests.push(newReq)
  res.json({ code: 200, data: enrich(newReq) })
})

// 编辑
router.put('/:id', (req, res) => {
  const item = hiringRequests.find(r => r.id === parseInt(req.params.id))
  if (!item) {
    return res.json({ code: 404, message: '用人需求不存在' })
  }
  if (item.status === 'closed') {
    return res.json({ code: 400, message: '已关闭的需求不可编辑' })
  }
  const missing = validateFields(req.body)
  if (missing.length > 0) {
    return res.json({ code: 400, message: `以下字段为必填项：${missing.join('、')}` })
  }

  item.department = String(req.body.department).trim()
  item.position = String(req.body.position).trim()
  item.headcount = parseInt(req.body.headcount)
  item.level = String(req.body.level).trim()
  item.priority = req.body.priority || item.priority
  item.salaryRange = String(req.body.salaryRange).trim()
  item.location = String(req.body.location).trim()
  item.category = req.body.category ? String(req.body.category).trim() : item.category
  item.reason = req.body.reason ? String(req.body.reason).trim() : item.reason
  item.requirements = req.body.requirements ? String(req.body.requirements).trim() : item.requirements
  item.applicant = String(req.body.applicant).trim()
  item.updatedAt = new Date().toISOString()

  res.json({ code: 200, data: enrich(item) })
})

// 状态切换（单条）
router.put('/:id/status', (req, res) => {
  const item = hiringRequests.find(r => r.id === parseInt(req.params.id))
  if (!item) {
    return res.json({ code: 404, message: '用人需求不存在' })
  }
  const { status } = req.body
  if (!VALID_STATUSES.includes(status)) {
    return res.json({ code: 400, message: '非法的状态值' })
  }
  if (item.status === 'closed' && status !== 'closed') {
    return res.json({ code: 400, message: '已关闭的需求不可更改状态' })
  }
  item.status = status
  item.updatedAt = new Date().toISOString()
  res.json({ code: 200, data: enrich(item) })
})

// 批量通过 / 批量关闭
router.post('/batch', (req, res) => {
  const { ids, action } = req.body
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.json({ code: 400, message: '请选择需要操作的需求' })
  }
  if (!['approve', 'reject', 'close'].includes(action)) {
    return res.json({ code: 400, message: '非法的批量操作类型' })
  }
  const statusMap = { approve: 'approved', reject: 'rejected', close: 'closed' }
  const targetStatus = statusMap[action]
  let successCount = 0
  const failMessages = []
  const now = new Date().toISOString()

  ids.forEach(id => {
    const item = hiringRequests.find(r => r.id === parseInt(id))
    if (!item) {
      failMessages.push(`ID ${id} 不存在`)
      return
    }
    if (item.status === 'closed') {
      failMessages.push(`ID ${id} 已关闭，不可操作`)
      return
    }
    item.status = targetStatus
    item.updatedAt = now
    successCount++
  })

  res.json({
    code: 200,
    data: { successCount, total: ids.length, failMessages }
  })
})

// 基于需求发布职位（把职位和需求关联起来，并写回 relatedJobIds）
router.post('/:id/publish-job', (req, res) => {
  const item = hiringRequests.find(r => r.id === parseInt(req.params.id))
  if (!item) {
    return res.json({ code: 404, message: '用人需求不存在' })
  }
  if (item.status !== 'approved') {
    return res.json({ code: 400, message: '只有审批通过的需求才能发布职位' })
  }

  const { company, description, requirements } = req.body
  if (!company || !String(company).trim()) {
    return res.json({ code: 400, message: '公司名称为必填项' })
  }

  const now = new Date().toISOString()
  const jobId = getNextJobId()
  const newJob = {
    id: jobId,
    title: item.position,
    company: String(company).trim(),
    category: item.category,
    salary: item.salaryRange,
    location: item.location,
    experience: item.level,
    education: '本科',
    description: description ? String(description).trim() : item.reason,
    requirements: requirements ? String(requirements).trim() : item.requirements,
    hiringRequestId: item.id,
    hiringRequestNo: item.requestNo,
    createdAt: now,
    status: 'active'
  }
  jobs.push(newJob)

  if (!item.relatedJobIds.includes(jobId)) {
    item.relatedJobIds.push(jobId)
    item.updatedAt = now
  }

  res.json({ code: 200, data: { job: newJob, request: enrich(item) } })
})

module.exports = router
