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

export const statisticsApi = {
  overview() {
    return api.get('/statistics')
  },
  job(jobId) {
    return api.get(`/statistics/job/${jobId}`)
  }
}
