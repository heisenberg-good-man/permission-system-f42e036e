import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'JobList',
    component: () => import('../views/JobList.vue')
  },
  {
    path: '/job/:id',
    name: 'JobDetail',
    component: () => import('../views/JobDetail.vue')
  },
  {
    path: '/job/create',
    name: 'CreateJob',
    component: () => import('../views/CreateJob.vue')
  },
  {
    path: '/job/:id/edit',
    name: 'EditJob',
    component: () => import('../views/EditJob.vue')
  },
  {
    path: '/candidates',
    name: 'CandidateList',
    component: () => import('../views/CandidateList.vue')
  },
  {
    path: '/applications/:jobId',
    name: 'ApplicationList',
    component: () => import('../views/ApplicationList.vue')
  },
  {
    path: '/application/:id',
    name: 'ApplicationDetail',
    component: () => import('../views/ApplicationDetail.vue')
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: () => import('../views/Statistics.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
