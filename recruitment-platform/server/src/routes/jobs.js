const express = require('express')
const router = express.Router()
const { jobs, getNextJobId } = require('../data/mockData')

router.get('/', (req, res) => {
  const { keyword, category, location, salaryMin, salaryMax, page = 1, size = 10 } = req.query
  
  let filtered = [...jobs]
  
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
  const newJob = {
    id: getNextJobId(),
    ...req.body,
    createdAt: new Date().toISOString(),
    status: 'active'
  }
  jobs.push(newJob)
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
