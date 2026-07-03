import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'JobList',
    component: () => import('../views/JobList.vue'),
    meta: { title: '职位列表' }
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
    path: '/interviews',
    name: 'InterviewList',
    component: () => import('../views/InterviewList.vue')
  },
  {
    path: '/interview/:id',
    name: 'InterviewFeedback',
    component: () => import('../views/InterviewFeedback.vue')
  },
  {
    path: '/hiring-requests',
    name: 'HiringRequestList',
    component: () => import('../views/HiringRequestList.vue')
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: () => import('../views/Statistics.vue')
  },
  {
    path: '/notifications',
    name: 'NotificationList',
    component: () => import('../views/NotificationList.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
    meta: {
      code: 404,
      title: '页面不存在',
      desc: '您访问的页面不存在或已被移除，请检查地址是否正确，或返回首页继续浏览。'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
