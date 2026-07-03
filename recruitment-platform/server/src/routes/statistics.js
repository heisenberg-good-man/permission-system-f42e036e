const express = require('express')
const router = express.Router()
const { jobs, applications, interviews, feedbacks, hiringRequests, notifications } = require('../data/mockData')

const buildOverview = () => ({
  totalJobs: jobs.filter(j => j.status === 'active').length,
  totalApplications: applications.length,
  pendingCount: applications.filter(a => a.status === 'pending').length,
  contactedCount: applications.filter(a => a.status === 'contacted').length,
  interviewingCount: applications.filter(a => a.status === 'interviewing').length,
  offeredCount: applications.filter(a => a.status === 'offered').length,
  rejectedCount: applications.filter(a => a.status === 'rejected').length,
  interviewCount: interviews.length,
  feedbackCount: feedbacks.length,
  pendingFeedbackCount: interviews.filter(i => !feedbacks.some(f => f.interviewId === i.id)).length,
  totalHiringRequests: hiringRequests.length,
  pendingHiringRequestCount: hiringRequests.filter(r => r.status === 'pending').length,
  approvedHiringRequestCount: hiringRequests.filter(r => r.status === 'approved').length,
  rejectedHiringRequestCount: hiringRequests.filter(r => r.status === 'rejected').length,
  closedHiringRequestCount: hiringRequests.filter(r => r.status === 'closed').length,
  totalHeadcount: hiringRequests.reduce((sum, r) => sum + r.headcount, 0),
  filledHeadcount: hiringRequests.reduce((sum, r) => sum + (r.filledCount || 0), 0),
  totalNotifications: notifications.filter(n => !n.isIgnored).length,
  unreadNotificationCount: notifications.filter(n => !n.isRead && !n.isIgnored).length
})

router.get('/', (req, res) => {
  res.json({ code: 200, data: buildOverview() })
})

router.get('/job/:jobId', (req, res) => {
  const jobId = parseInt(req.params.jobId)
  const job = jobs.find(j => j.id === jobId)

  if (!job) {
    return res.json({ code: 404, message: '职位不存在' })
  }

  const jobApplications = applications.filter(a => a.jobId === jobId)
  const jobInterviews = interviews.filter(i => i.jobId === jobId)
  const jobFeedbacks = feedbacks.filter(f => jobApplications.some(a => a.id === f.applicationId))

  const statistics = {
    jobId,
    jobTitle: job.title,
    totalApplications: jobApplications.length,
    pendingCount: jobApplications.filter(a => a.status === 'pending').length,
    contactedCount: jobApplications.filter(a => a.status === 'contacted').length,
    interviewingCount: jobApplications.filter(a => a.status === 'interviewing').length,
    offeredCount: jobApplications.filter(a => a.status === 'offered').length,
    rejectedCount: jobApplications.filter(a => a.status === 'rejected').length,
    interviewCount: jobInterviews.length,
    feedbackCount: jobFeedbacks.length
  }
  res.json({ code: 200, data: statistics })
})

module.exports = router
