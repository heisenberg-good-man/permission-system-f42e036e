const express = require('express')
const router = express.Router()
const { messages, getNextMessageId, applications } = require('../data/mockData')

router.post('/', (req, res) => {
  const { applicationId, senderType, content } = req.body
  
  const validSenderTypes = ['recruiter', 'candidate']
  if (!validSenderTypes.includes(senderType)) {
    return res.json({ code: 400, message: '无效的发送方类型' })
  }
  
  const application = applications.find(a => a.id === parseInt(applicationId))
  if (!application) {
    return res.json({ code: 404, message: '投递记录不存在' })
  }
  
  const newMessage = {
    id: getNextMessageId(),
    applicationId: parseInt(applicationId),
    senderType,
    content,
    createdAt: new Date().toISOString()
  }
  messages.push(newMessage)
  res.json({ code: 200, data: newMessage })
})

router.get('/application/:applicationId', (req, res) => {
  const applicationId = parseInt(req.params.applicationId)
  const applicationMessages = messages.filter(m => m.applicationId === applicationId)
  applicationMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  res.json({ code: 200, data: applicationMessages })
})

module.exports = router
