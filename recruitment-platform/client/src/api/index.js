import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

export const jobApi = {
  list(params) {
    return api.get('/jobs', { params })
  },
  get(id) {
    return api.get(`/jobs/${id}`)
  },
  create(data) {
    return api.post('/jobs', data)
  },
  update(id, data) {
    return api.put(`/jobs/${id}`, data)
  },
  delete(id) {
    return api.delete(`/jobs/${id}`)
  }
}

export const applicationApi = {
  create(data) {
    return api.post('/applications', data)
  },
  list(jobId, params) {
    return api.get(`/applications/job/${jobId}`, { params })
  },
  all(params) {
    return api.get('/applications', { params })
  },
  get(id) {
    return api.get(`/applications/${id}`)
  },
  updateStatus(id, status) {
    return api.put(`/applications/${id}/status`, { status })
  }
}

export const messageApi = {
  create(data) {
    return api.post('/messages', data)
  },
  list(applicationId) {
    return api.get(`/messages/application/${applicationId}`)
  }
}

export const interviewApi = {
  list(params) {
    return api.get('/interviews', { params })
  },
  get(id) {
    return api.get(`/interviews/${id}`)
  },
  listByApplication(applicationId) {
    return api.get(`/interviews/application/${applicationId}`)
  },
  create(data) {
    return api.post('/interviews', data)
  },
  saveFeedback(id, data) {
    return api.put(`/interviews/${id}/feedback`, data)
  }
}

export const hiringRequestApi = {
  list(params) {
    return api.get('/hiring-requests', { params })
  },
  simple() {
    return api.get('/hiring-requests/simple')
  },
  get(id) {
    return api.get(`/hiring-requests/${id}`)
  },
  create(data) {
    return api.post('/hiring-requests', data)
  },
  update(id, data) {
    return api.put(`/hiring-requests/${id}`, data)
  },
  updateStatus(id, status) {
    return api.put(`/hiring-requests/${id}/status`, { status })
  },
  batch(ids, action) {
    return api.post('/hiring-requests/batch', { ids, action })
  },
  publishJob(id, data) {
    return api.post(`/hiring-requests/${id}/publish-job`, data)
  }
}

export const statisticsApi = {
  overview() {
    return api.get('/statistics')
  },
  job(jobId) {
    return api.get(`/statistics/job/${jobId}`)
  }
}

export const notificationApi = {
  list(params) {
    return api.get('/notifications', { params })
  },
  unreadCount(role) {
    return api.get('/notifications/unread-count', { params: { role } })
  },
  summary(role) {
    return api.get('/notifications/summary', { params: { role } })
  },
  get(id) {
    return api.get(`/notifications/${id}`)
  },
  markRead(id) {
    return api.put(`/notifications/${id}/read`)
  },
  markAllRead(role) {
    return api.put('/notifications/read-all', { role })
  },
  ignore(id) {
    return api.put(`/notifications/${id}/ignore`)
  }
}
