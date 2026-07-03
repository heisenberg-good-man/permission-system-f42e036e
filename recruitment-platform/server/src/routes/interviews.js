const express = require('express')
const router = express.Router()
const {
  interviews,
  feedbacks,
  applications,
  messages,
  getNextInterviewId,
  getNextFeedbackId,
  getNextMessageId
} = require('../data/mockData')

const VALID_ROUNDS = [1, 2, 3]
const VALID_INTERVIEW_STATUSES = ['scheduled', 'completed', 'cancelled']
const VALID_CONCLUSIONS = ['next_round', 'pending', 'offer', 'reject']

const CONCLUSION_META = {
  next_round: { action: '进入下一轮', message: '您的面试已通过，将进入下一轮，请留意后续安排。', appStatus: 'interviewing' },
  pending: { action: '面试待定', message: '面试结果待定，HR 将进一步评估后与您联系。', appStatus: 'interviewing' },
  offer: { action: '发 Offer', message: '恭喜您通过面试，我们将向您发放 Offer。', appStatus: 'offered' },
  reject: { action: '已淘汰', message: '很遗憾您本次未通过面试，感谢您的参与。', appStatus: 'rejected' }
}

const attachFeedback = (interview) => {
  if (!interview) return interview
  const fb = feedbacks.find(f => f.interviewId === interview.id)
  return {
    ...interview,
    feedback: fb || null,
    feedbackStatus: fb ? 'submitted' : 'pending'
  }
}

// 列表（带筛选 + 分页）
router.get('/', (req, res) => {
  const { jobId, candidateName, round, feedbackStatus, status, page = 1, size = 10 } = req.query

  let filtered = [...interviews]

  if (jobId) {
    filtered = filtered.filter(i => i.jobId === parseInt(jobId))
  }
  if (candidateName) {
    const kw = String(candidateName).trim()
    filtered = filtered.filter(i => i.candidateName.includes(kw) || i.interviewer.includes(kw))
  }
  if (round) {
    filtered = filtered.filter(i => i.round === parseInt(round))
  }
  if (status) {
    filtered = filtered.filter(i => i.status === status)
  }

  let list = filtered.map(attachFeedback)

  if (feedbackStatus) {
    list = list.filter(i => i.feedbackStatus === feedbackStatus)
  }

  list.sort((a, b) => new Date(b.scheduledTime) - new Date(a.scheduledTime))

  const total = list.length
  const start = (parseInt(page) - 1) * parseInt(size)
  const paginated = list.slice(start, start + parseInt(size))

  res.json({
    code: 200,
    data: { list: paginated, total, page: parseInt(page), size: parseInt(size) }
  })
})

// 某投递下的所有面试（供候选人/投递详情展示）
router.get('/application/:applicationId', (req, res) => {
  const applicationId = parseInt(req.params.applicationId)
  const list = interviews
    .filter(i => i.applicationId === applicationId)
    .map(attachFeedback)
    .sort((a, b) => a.round - b.round)

  res.json({ code: 200, data: list })
})

// 详情：聚合 application 简历摘要 + messages + 已有 feedback
router.get('/:id', (req, res) => {
  const interview = interviews.find(i => i.id === parseInt(req.params.id))
  if (!interview) {
    return res.json({ code: 404, message: '面试记录不存在' })
  }

  const application = applications.find(a => a.id === interview.applicationId)
  const appMessages = messages
    .filter(m => m.applicationId === interview.applicationId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

  res.json({
    code: 200,
    data: {
      ...attachFeedback(interview),
      application: application || null,
      messages: appMessages
    }
  })
})

// 安排面试
router.post('/', (req, res) => {
  const { applicationId, round, roundName, interviewer, scheduledTime, location } = req.body
  const missingFields = []

  if (!applicationId) missingFields.push('投递ID')
  if (!round || !VALID_ROUNDS.includes(parseInt(round))) missingFields.push('面试轮次')
  if (!interviewer || !String(interviewer).trim()) missingFields.push('面试官')
  if (!scheduledTime || !String(scheduledTime).trim()) missingFields.push('面试时间')

  if (missingFields.length > 0) {
    return res.json({ code: 400, message: `以下字段为必填项：${missingFields.join('、')}` })
  }

  const application = applications.find(a => a.id === parseInt(applicationId))
  if (!application) {
    return res.json({ code: 404, message: '投递记录不存在' })
  }

  if (application.status === 'rejected' || application.status === 'offered') {
    return res.json({ code: 400, message: '该候选人已淘汰或已发 Offer，不可再安排面试' })
  }

  const roundNum = parseInt(round)
  const roundNameMap = { 1: '初试', 2: '复试', 3: '终试' }

  const newInterview = {
    id: getNextInterviewId(),
    applicationId: application.id,
    jobId: application.jobId,
    jobTitle: application.jobTitle,
    candidateName: application.candidateName,
    round: roundNum,
    roundName: roundName ? String(roundName) : roundNameMap[roundNum],
    interviewer: String(interviewer).trim(),
    scheduledTime: String(scheduledTime),
    location: location ? String(location) : '待定',
    status: 'scheduled',
    createdAt: new Date().toISOString()
  }
  interviews.push(newInterview)
  res.json({ code: 200, data: attachFeedback(newInterview) })
})

// 提交/更新反馈（upsert，杜绝重复提交）
router.put('/:id/feedback', (req, res) => {
  const interview = interviews.find(i => i.id === parseInt(req.params.id))
  if (!interview) {
    return res.json({ code: 404, message: '面试记录不存在' })
  }

  const application = applications.find(a => a.id === interview.applicationId)
  if (!application) {
    return res.json({ code: 404, message: '投递记录不存在' })
  }

  const existing = feedbacks.find(f => f.interviewId === interview.id)

  // 终态阻断：已发 Offer / 已淘汰，且当前面试尚无反馈 → 不允许新建普通反馈
  const isTerminal = application.status === 'rejected' || application.status === 'offered'
  if (isTerminal && !existing) {
    const label = application.status === 'offered' ? '已发 Offer' : '已淘汰'
    return res.json({ code: 400, message: `该候选人${label}，不可再提交普通面试反馈` })
  }

  const { rating, strengths, risks, conclusion, comment, interviewer } = req.body
  const missingFields = []
  if (rating === undefined || rating === null || rating === '' || isNaN(Number(rating))) {
    missingFields.push('评分')
  }
  if (!conclusion || !VALID_CONCLUSIONS.includes(conclusion)) {
    missingFields.push('结论建议')
  }

  if (missingFields.length > 0) {
    return res.json({ code: 400, message: `以下字段为必填项：${missingFields.join('、')}` })
  }

  const ratingNum = Math.max(1, Math.min(5, parseInt(rating)))
  const now = new Date().toISOString()
  const interviewerValue = (interviewer && String(interviewer).trim()) || interview.interviewer

  if (existing) {
    existing.rating = ratingNum
    existing.strengths = strengths || ''
    existing.risks = risks || ''
    existing.conclusion = conclusion
    existing.comment = comment || ''
    existing.interviewer = interviewerValue
    existing.updatedAt = now
  } else {
    feedbacks.push({
      id: getNextFeedbackId(),
      interviewId: interview.id,
      applicationId: interview.applicationId,
      rating: ratingNum,
      strengths: strengths || '',
      risks: risks || '',
      conclusion,
      comment: comment || '',
      interviewer: interviewerValue,
      createdAt: now,
      updatedAt: now
    })
  }

  // 面试状态置为已完成
  interview.status = 'completed'

  // 候选人状态联动：更新 application.status + timeline + 自动沟通记录
  const meta = CONCLUSION_META[conclusion]
  const statusChanged = application.status !== meta.appStatus
  application.status = meta.appStatus

  if (!application.timeline) application.timeline = []
  application.timeline.push({
    status: meta.appStatus,
    action: meta.action,
    time: now
  })

  messages.push({
    id: getNextMessageId(),
    applicationId: application.id,
    senderType: 'recruiter',
    content: meta.message,
    createdAt: now
  })

  res.json({
    code: 200,
    data: {
      ...attachFeedback(interview),
      statusChanged,
      message: '反馈保存成功'
    }
  })
})

module.exports = router
