const express = require('express')
const router = express.Router()
const { jobs, applications } = require('../data/mockData')

router.get('/', (req, res) => {
  const statistics = {
    totalJobs: jobs.filter(j => j.status === 'active').length,
    totalApplications: applications.length,
    pendingCount: applications.filter(a => a.status === 'pending').length,
    contactedCount: applications.filter(a => a.status === 'contacted').length,
    interviewingCount: applications.filter(a => a.status === 'interviewing').length,
    rejectedCount: applications.filter(a => a.status === 'rejected').length
  }
  res.json({ code: 200, data: statistics })
})

router.get('/job/:jobId', (req, res) => {
  const jobId = parseInt(req.params.jobId)
  const job = jobs.find(j => j.id === jobId)
  
  if (!job) {
    return res.json({ code: 404, message: '职位不存在' })
  }
  
  const jobApplications = applications.filter(a => a.jobId === jobId)
  const statistics = {
    jobId,
    jobTitle: job.title,
    totalApplications: jobApplications.length,
    pendingCount: jobApplications.filter(a => a.status === 'pending').length,
    contactedCount: jobApplications.filter(a => a.status === 'contacted').length,
    interviewingCount: jobApplications.filter(a => a.status === 'interviewing').length,
    rejectedCount: jobApplications.filter(a => a.status === 'rejected').length
  }
  res.json({ code: 200, data: statistics })
})

module.exports = router
