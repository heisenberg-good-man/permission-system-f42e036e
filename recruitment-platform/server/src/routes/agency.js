const express = require('express')
const router = express.Router()
const {
  agencyWorkers,
  agencyOrders,
  agencyOrderMessages,
  notifications,
  getNextAgencyWorkerId,
  getNextAgencyOrderId,
  getNextAgencyOrderMessageId,
  getNextNotificationId
} = require('../data/mockData')

// 职业类别白名单
const PROFESSIONS = ['保姆', '月嫂', '育儿嫂', '护工', '保洁', '维修工', '钟点工', '其他']

// 实名认证状态
const AUTH_STATUS_LABELS = {
  unverified: '未认证',
  pending: '审核中',
  verified: '已认证',
  rejected: '已驳回'
}

// 订单状态
const ORDER_STATUS_LABELS = {
  pending: '待确认',
  confirmed: '已确认',
  in_progress: '进行中',
  completed: '已完成',
  cancelled: '已取消'
}

const ORDER_STATUS_FLOW = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed: [],
  cancelled: []
}

const TERMINAL_ORDER_STATUSES = ['completed', 'cancelled']

const ORDER_STATUS_ACTIONS = {
  pending: '客户下单',
  confirmed: '服务人员确认接单',
  in_progress: '开始服务',
  completed: '服务完成',
  cancelled: '订单取消'
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

const isForwardTransition = (from, to) => {
  if (from === to) return false
  const allowed = ORDER_STATUS_FLOW[from] || []
  return allowed.includes(to)
}

// ============ 服务人员相关 ============

// 服务人员列表（支持按职业、城市、关键词、认证状态筛选）
router.get('/workers', (req, res) => {
  const { profession, city, keyword, authStatus, page = 1, size = 10 } = req.query

  let filtered = [...agencyWorkers]

  if (profession) {
    filtered = filtered.filter(w => w.profession === profession)
  }

  if (city) {
    filtered = filtered.filter(w => w.city === city)
  }

  if (authStatus) {
    filtered = filtered.filter(w => w.authStatus === authStatus)
  }

  if (keyword) {
    const kw = String(keyword)
    filtered = filtered.filter(w =>
      w.name.includes(kw) ||
      w.profession.includes(kw) ||
      (w.skills && w.skills.includes(kw)) ||
      (w.description && w.description.includes(kw))
    )
  }

  const start = (parseInt(page) - 1) * parseInt(size)
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

// 服务人员详情
router.get('/workers/:id', (req, res) => {
  const worker = agencyWorkers.find(w => w.id === parseInt(req.params.id))
  if (worker) {
    res.json({ code: 200, data: worker })
  } else {
    res.json({ code: 404, message: '服务人员不存在' })
  }
})

// 注册成为服务人员（职业声明）
router.post('/workers', (req, res) => {
  const { name, phone, city, profession, skills, experience, description, expectedSalary } = req.body

  const missingFields = []
  if (!name || !name.trim()) missingFields.push('姓名')
  if (!phone || !phone.trim()) missingFields.push('手机号')
  if (!city || !city.trim()) missingFields.push('城市')
  if (!profession) missingFields.push('职业类别')

  if (missingFields.length > 0) {
    return res.json({ code: 400, message: `以下字段为必填项：${missingFields.join('、')}` })
  }

  // 手机号格式校验
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(String(phone).trim())) {
    return res.json({ code: 400, message: '手机号格式不正确，请输入 11 位有效手机号' })
  }

  // 职业类别校验
  if (!PROFESSIONS.includes(profession)) {
    return res.json({
      code: 400,
      message: `职业类别无效，可选：${PROFESSIONS.join('、')}`
    })
  }

  // 同手机号不能重复注册
  const existing = agencyWorkers.find(w => w.phone === String(phone).trim())
  if (existing) {
    return res.json({
      code: 409,
      message: '该手机号已注册为服务人员',
      data: { workerId: existing.id }
    })
  }

  const now = new Date().toISOString()
  const newWorker = {
    id: getNextAgencyWorkerId(),
    name: name.trim(),
    phone: phone.trim(),
    city: city.trim(),
    profession,
    skills: skills || '',
    experience: experience || '',
    description: description || '',
    expectedSalary: expectedSalary || '',
    authStatus: 'unverified',
    authInfo: null,
    authRemark: '',
    authTime: null,
    rating: 0,
    orderCount: 0,
    status: 'available',
    createdAt: now
  }
  agencyWorkers.push(newWorker)

  // 通知：新服务人员注册（平台审核）
  pushNotification({
    role: 'recruiter',
    type: 'agency_worker_register',
    title: '新服务人员注册',
    content: `${newWorker.name} 注册为${newWorker.profession}，待实名认证。`,
    priority: 'normal',
    relatedType: 'agency_worker',
    relatedId: newWorker.id,
    linkUrl: `/agency/worker/${newWorker.id}`
  })

  res.json({ code: 200, data: newWorker })
})

// 提交实名认证
router.put('/workers/:id/auth', (req, res) => {
  const { realName, idCard, idCardFront, idCardBack } = req.body

  const missingFields = []
  if (!realName || !realName.trim()) missingFields.push('真实姓名')
  if (!idCard || !idCard.trim()) missingFields.push('身份证号')

  if (missingFields.length > 0) {
    return res.json({ code: 400, message: `以下字段为必填项：${missingFields.join('、')}` })
  }

  // 身份证号格式校验（18位，最后一位可以是X）
  const idCardRegex = /^\d{17}[\dXx]$/
  if (!idCardRegex.test(String(idCard).trim())) {
    return res.json({ code: 400, message: '身份证号格式不正确，请输入 18 位有效身份证号' })
  }

  const worker = agencyWorkers.find(w => w.id === parseInt(req.params.id))
  if (!worker) {
    return res.json({ code: 404, message: '服务人员不存在' })
  }

  // 已认证不能再提交
  if (worker.authStatus === 'verified') {
    return res.json({ code: 403, message: '该服务人员已通过实名认证，无需重复提交' })
  }

  // 审核中不能重复提交
  if (worker.authStatus === 'pending') {
    return res.json({ code: 403, message: '实名认证正在审核中，请耐心等待' })
  }

  worker.authStatus = 'pending'
  worker.authInfo = {
    realName: realName.trim(),
    idCard: idCard.trim(),
    idCardFront: idCardFront || '',
    idCardBack: idCardBack || ''
  }
  worker.authRemark = ''

  // 通知：实名认证提交（平台审核）
  pushNotification({
    role: 'recruiter',
    type: 'agency_auth_submit',
    title: '实名认证待审核',
    content: `${worker.name} 提交了实名认证，请及时审核。`,
    priority: 'high',
    relatedType: 'agency_worker',
    relatedId: worker.id,
    linkUrl: `/agency/worker/${worker.id}`
  })

  res.json({
    code: 200,
    data: {
      authStatus: worker.authStatus,
      authInfo: worker.authInfo
    }
  })
})

// 审核实名认证（平台操作：通过/驳回）
router.put('/workers/:id/auth/verify', (req, res) => {
  const { action, remark } = req.body

  if (!action || !['approve', 'reject'].includes(action)) {
    return res.json({ code: 400, message: '审核操作无效，可选：approve / reject' })
  }

  const worker = agencyWorkers.find(w => w.id === parseInt(req.params.id))
  if (!worker) {
    return res.json({ code: 404, message: '服务人员不存在' })
  }

  if (worker.authStatus !== 'pending') {
    return res.json({
      code: 403,
      message: `当前认证状态为「${AUTH_STATUS_LABELS[worker.authStatus]}」，不可审核`
    })
  }

  worker.authStatus = action === 'approve' ? 'verified' : 'rejected'
  worker.authRemark = remark || (action === 'approve' ? '审核通过' : '审核未通过')
  worker.authTime = new Date().toISOString()

  // 通知：认证审核结果（通知服务人员）
  pushNotification({
    role: 'candidate',
    type: 'agency_auth_result',
    title: '实名认证审核结果',
    content: action === 'approve'
      ? `您的实名认证已通过审核，现在可以接单了。`
      : `您的实名认证未通过，原因：${worker.authRemark}。请补充材料后重新提交。`,
    priority: 'high',
    relatedType: 'agency_worker',
    relatedId: worker.id,
    linkUrl: `/agency/worker/${worker.id}`
  })

  res.json({
    code: 200,
    data: {
      authStatus: worker.authStatus,
      authRemark: worker.authRemark,
      authTime: worker.authTime
    }
  })
})

// ============ 订单相关 ============

// 订单列表（支持按状态、职业、客户/服务人员筛选）
router.get('/orders', (req, res) => {
  const { status, profession, workerId, keyword, page = 1, size = 10 } = req.query

  let filtered = [...agencyOrders]

  if (status) {
    filtered = filtered.filter(o => o.status === status)
  }

  if (profession) {
    filtered = filtered.filter(o => o.profession === profession)
  }

  if (workerId) {
    filtered = filtered.filter(o => o.workerId === parseInt(workerId))
  }

  if (keyword) {
    const kw = String(keyword)
    filtered = filtered.filter(o =>
      o.customerName.includes(kw) ||
      o.customerPhone.includes(kw) ||
      o.workerName.includes(kw) ||
      o.description.includes(kw) ||
      o.profession.includes(kw)
    )
  }

  // 按创建时间倒序
  filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const start = (parseInt(page) - 1) * parseInt(size)
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

// 订单详情
router.get('/orders/:id', (req, res) => {
  const order = agencyOrders.find(o => o.id === parseInt(req.params.id))
  if (order) {
    res.json({ code: 200, data: order })
  } else {
    res.json({ code: 404, message: '订单不存在' })
  }
})

// 创建订单（用户下单）
router.post('/orders', (req, res) => {
  const { workerId, customerName, customerPhone, customerAddress, description, scheduledTime, budget } = req.body

  const missingFields = []
  if (!workerId) missingFields.push('服务人员')
  if (!customerName || !customerName.trim()) missingFields.push('客户姓名')
  if (!customerPhone || !customerPhone.trim()) missingFields.push('客户手机号')
  if (!customerAddress || !customerAddress.trim()) missingFields.push('服务地址')
  if (!description || !description.trim()) missingFields.push('需求描述')

  if (missingFields.length > 0) {
    return res.json({ code: 400, message: `以下字段为必填项：${missingFields.join('、')}` })
  }

  // 手机号格式校验
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(String(customerPhone).trim())) {
    return res.json({ code: 400, message: '客户手机号格式不正确，请输入 11 位有效手机号' })
  }

  const worker = agencyWorkers.find(w => w.id === parseInt(workerId))
  if (!worker) {
    return res.json({ code: 404, message: '服务人员不存在' })
  }

  // 服务人员必须通过实名认证才能接单
  if (worker.authStatus !== 'verified') {
    return res.json({
      code: 403,
      message: `服务人员${worker.name}未通过实名认证（当前：${AUTH_STATUS_LABELS[worker.authStatus]}），暂不可下单`
    })
  }

  // 服务人员忙碌中不可下单
  if (worker.status === 'busy') {
    return res.json({ code: 403, message: `服务人员${worker.name}当前正在服务中，暂不可接新单` })
  }

  // 同一客户不能对同一服务人员重复下单（待确认/已确认/进行中状态）
  const existingActive = agencyOrders.find(o =>
    o.workerId === parseInt(workerId) &&
    o.customerPhone === String(customerPhone).trim() &&
    ['pending', 'confirmed', 'in_progress'].includes(o.status)
  )
  if (existingActive) {
    return res.json({
      code: 409,
      message: '您已对该服务人员下单且订单未完成，请勿重复下单',
      data: { orderId: existingActive.id }
    })
  }

  const now = new Date().toISOString()
  const newOrder = {
    id: getNextAgencyOrderId(),
    workerId: worker.id,
    workerName: worker.name,
    workerPhone: worker.phone,
    profession: worker.profession,
    customerName: customerName.trim(),
    customerPhone: customerPhone.trim(),
    customerAddress: customerAddress.trim(),
    description: description.trim(),
    scheduledTime: scheduledTime || '',
    budget: budget || '',
    status: 'pending',
    timeline: [{ status: 'pending', action: '客户下单', time: now }],
    createdAt: now
  }
  agencyOrders.push(newOrder)

  // 通知：新订单（通知服务人员）
  pushNotification({
    role: 'candidate',
    type: 'agency_new_order',
    title: '新服务订单',
    content: `${newOrder.customerName} 向您下了${newOrder.profession}订单，请及时确认。`,
    priority: 'high',
    relatedType: 'agency_order',
    relatedId: newOrder.id,
    linkUrl: `/agency/order/${newOrder.id}`
  })

  // 通知：新订单（通知平台）
  pushNotification({
    role: 'recruiter',
    type: 'agency_new_order',
    title: '新服务订单提醒',
    content: `${newOrder.customerName} 向 ${newOrder.workerName} 下了${newOrder.profession}订单。`,
    priority: 'normal',
    relatedType: 'agency_order',
    relatedId: newOrder.id,
    linkUrl: `/agency/order/${newOrder.id}`
  })

  res.json({ code: 200, data: newOrder })
})

// 更新订单状态
router.put('/orders/:id/status', (req, res) => {
  const { status } = req.body
  const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']

  if (!validStatuses.includes(status)) {
    return res.json({ code: 400, message: '无效的订单状态' })
  }

  const order = agencyOrders.find(o => o.id === parseInt(req.params.id))
  if (!order) {
    return res.json({ code: 404, message: '订单不存在' })
  }

  const previousStatus = order.status

  // 相同状态无需变更
  if (previousStatus === status) {
    return res.json({ code: 400, message: '当前状态与目标状态一致，无需变更' })
  }

  // 终态不可变更
  if (TERMINAL_ORDER_STATUSES.includes(previousStatus)) {
    return res.json({
      code: 403,
      message: `订单当前状态为「${ORDER_STATUS_LABELS[previousStatus]}」，为终态不可再次变更`
    })
  }

  // 状态流转校验
  if (!isForwardTransition(previousStatus, status)) {
    return res.json({
      code: 403,
      message: `订单状态不能从「${ORDER_STATUS_LABELS[previousStatus]}」变更为「${ORDER_STATUS_LABELS[status]}」`
    })
  }

  if (!order.timeline) order.timeline = []
  order.status = status
  order.timeline.push({
    status,
    action: ORDER_STATUS_ACTIONS[status] || status,
    time: new Date().toISOString()
  })

  // 状态变更时同步服务人员状态
  const worker = agencyWorkers.find(w => w.id === order.workerId)
  if (worker) {
    if (status === 'confirmed' || status === 'in_progress') {
      worker.status = 'busy'
    } else if (status === 'completed' || status === 'cancelled') {
      // 检查是否还有进行中的订单
      const hasActive = agencyOrders.some(o =>
        o.workerId === worker.id &&
        ['confirmed', 'in_progress'].includes(o.status)
      )
      worker.status = hasActive ? 'busy' : 'available'
      if (status === 'completed') {
        worker.orderCount = (worker.orderCount || 0) + 1
      }
    }
  }

  // 通知：订单状态变更
  pushNotification({
    role: 'candidate',
    type: 'agency_order_status',
    title: '订单状态更新',
    content: `您的${order.profession}订单状态已更新为：${ORDER_STATUS_LABELS[status]}。`,
    priority: status === 'completed' || status === 'cancelled' ? 'high' : 'normal',
    relatedType: 'agency_order',
    relatedId: order.id,
    linkUrl: `/agency/order/${order.id}`
  })

  res.json({ code: 200, data: order })
})

// ============ 订单消息相关 ============

// 获取订单消息
router.get('/orders/:id/messages', (req, res) => {
  const orderId = parseInt(req.params.id)
  const order = agencyOrders.find(o => o.id === orderId)
  if (!order) {
    return res.json({ code: 404, message: '订单不存在' })
  }
  const list = agencyOrderMessages.filter(m => m.orderId === orderId)
  res.json({ code: 200, data: list })
})

// 发送订单消息
router.post('/orders/:id/messages', (req, res) => {
  const { senderType, content } = req.body
  const orderId = parseInt(req.params.id)

  const order = agencyOrders.find(o => o.id === orderId)
  if (!order) {
    return res.json({ code: 404, message: '订单不存在' })
  }

  if (!['customer', 'worker', 'platform'].includes(senderType)) {
    return res.json({ code: 400, message: '发送者类型无效' })
  }

  if (!content || !content.trim()) {
    return res.json({ code: 400, message: '消息内容不能为空' })
  }

  // 终态订单不可发送消息
  if (TERMINAL_ORDER_STATUSES.includes(order.status)) {
    return res.json({
      code: 403,
      message: `订单已${ORDER_STATUS_LABELS[order.status]}，不可再发送消息`
    })
  }

  const now = new Date().toISOString()
  const newMessage = {
    id: getNextAgencyOrderMessageId(),
    orderId,
    senderType,
    content: content.trim(),
    createdAt: now
  }
  agencyOrderMessages.push(newMessage)

  // 通知对方有新消息
  const notifyRole = senderType === 'customer' ? 'candidate' : 'recruiter'
  const senderLabel = senderType === 'customer' ? '客户' : (senderType === 'worker' ? '服务人员' : '平台')
  pushNotification({
    role: notifyRole,
    type: 'agency_order_message',
    title: '新订单消息',
    content: `${senderLabel}在订单中发送了新消息：${content.trim().slice(0, 30)}`,
    priority: 'normal',
    relatedType: 'agency_order',
    relatedId: order.id,
    linkUrl: `/agency/order/${order.id}`
  })

  res.json({ code: 200, data: newMessage })
})

module.exports = router
