const express = require('express')
const router = express.Router()
const { jobs, hiringRequests, getNextJobId } = require('../data/mockData')

router.get('/', (req, res) => {
  const { keyword, category, location, salaryMin, salaryMax, status, includeClosed, page = 1, size = 10 } = req.query

  let filtered = [...jobs]

  // 默认只展示 active 职位，除非显式传入 includeClosed=true
  if (includeClosed !== 'true' && !status) {
    filtered = filtered.filter(job => job.status === 'active')
  }
  if (status) {
    filtered = filtered.filter(job => job.status === status)
  }

  if (keyword) {
    filtered = filtered.filter(job =>
      job.title.includes(keyword) || job.company.includes(keyword)
    )
  }
  
  if (category) {
    filtered = filtered.filter(job => job.category === category)
  }
  
  if (location) {
    filtered = filtered.filter(job => job.location === location)
  }
  
  if (salaryMin) {
    filtered = filtered.filter(job => {
      const min = parseInt(job.salary.split('-')[0]) || 0
      return min >= parseInt(salaryMin)
    })
  }
  
  if (salaryMax) {
    filtered = filtered.filter(job => {
      const max = parseInt(job.salary.split('-')[1]) || Infinity
      return max <= parseInt(salaryMax)
    })
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
  const job = jobs.find(j => j.id === parseInt(req.params.id))
  if (job) {
    res.json({ code: 200, data: job })
  } else {
    res.json({ code: 404, message: '职位不存在' })
  }
})

router.post('/', (req, res) => {
  const { title, company, salary, description, requirements, hiringRequestId } = req.body
  const missingFields = []
  
  if (!title || !title.trim()) missingFields.push('职位名称')
  if (!company || !company.trim()) missingFields.push('公司名称')
  if (!salary || !salary.trim()) missingFields.push('薪资范围')
  if (!description || !description.trim()) missingFields.push('职位描述')
  if (!requirements || !requirements.trim()) missingFields.push('任职要求')
  
  if (missingFields.length > 0) {
    return res.json({ 
      code: 400, 
      message: `以下字段为必填项：${missingFields.join('、')}` 
    })
  }

  let hiringRequestNo = ''
  if (hiringRequestId) {
    const hr = hiringRequests.find(r => r.id === parseInt(hiringRequestId))
    if (!hr) {
      return res.json({ code: 400, message: '关联的用人需求不存在' })
    }
    if (hr.status !== 'approved') {
      return res.json({ code: 400, message: '只有审批通过的用人需求才能发布职位' })
    }
    hiringRequestNo = hr.requestNo
  }
  
  const newJob = {
    id: getNextJobId(),
    ...req.body,
    hiringRequestId: hiringRequestId ? parseInt(hiringRequestId) : undefined,
    hiringRequestNo,
    createdAt: new Date().toISOString(),
    status: 'active'
  }
  jobs.push(newJob)

  if (hiringRequestId) {
    const hr = hiringRequests.find(r => r.id === parseInt(hiringRequestId))
    if (hr && !hr.relatedJobIds.includes(newJob.id)) {
      hr.relatedJobIds.push(newJob.id)
      hr.updatedAt = new Date().toISOString()
    }
  }

  res.json({ code: 200, data: newJob })
})

router.put('/:id', (req, res) => {
  const index = jobs.findIndex(j => j.id === parseInt(req.params.id))
  if (index !== -1) {
    jobs[index] = { ...jobs[index], ...req.body }
    res.json({ code: 200, data: jobs[index] })
  } else {
    res.json({ code: 404, message: '职位不存在' })
  }
})

router.delete('/:id', (req, res) => {
  const index = jobs.findIndex(j => j.id === parseInt(req.params.id))
  if (index !== -1) {
    jobs.splice(index, 1)
    res.json({ code: 200, message: '删除成功' })
  } else {
    res.json({ code: 404, message: '职位不存在' })
  }
})

module.exports = router
