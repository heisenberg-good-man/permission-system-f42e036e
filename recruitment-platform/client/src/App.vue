<template>
  <div class="app-container">
    <header class="app-header">
      <div class="header-content">
        <div class="logo" @click="$router.push('/')">招聘平台</div>
        <nav class="nav-menu">
          <router-link to="/" class="nav-item">职位列表</router-link>
          <router-link to="/candidates" class="nav-item">候选人列表</router-link>
          <router-link to="/job/create" class="nav-item">发布职位</router-link>
          <router-link to="/interviews" class="nav-item">面试反馈</router-link>
          <router-link to="/hiring-requests" class="nav-item">用人需求</router-link>
          <router-link to="/statistics" class="nav-item">统计概览</router-link>
          <router-link to="/notifications" class="nav-item nav-item-notification">
            通知中心
            <span v-if="unreadCount > 0" class="unread-badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
          </router-link>
        </nav>
      </div>
    </header>
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, provide } from 'vue'
import { notificationApi } from './api'

const unreadCount = ref(0)
let timer = null

const fetchUnreadCount = async () => {
  try {
    const res = await notificationApi.unreadCount()
    if (res.data.code === 200) {
      unreadCount.value = res.data.data.count
    }
  } catch (e) {
    // 静默失败，不打扰用户
  }
}

// 提供给子组件刷新未读数（标记已读/忽略后调用）
provide('refreshUnreadCount', fetchUnreadCount)

onMounted(() => {
  fetchUnreadCount()
  // 每 30 秒轮询一次未读数，模拟实时提醒
  timer = setInterval(fetchUnreadCount, 30000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.app-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.app-header {
  background-color: #409eff;
  color: white;
  padding: 0 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
}

.logo {
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
}

.nav-menu {
  display: flex;
  gap: 20px;
  align-items: center;
}

.nav-item {
  color: white;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 4px;
  transition: background-color 0.3s;
  position: relative;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.nav-item-notification {
  display: inline-flex;
  align-items: center;
}

.unread-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  margin-left: 6px;
  font-size: 11px;
  font-weight: bold;
  color: #f56c6c;
  background-color: #fff;
  border-radius: 9px;
  line-height: 1;
}

.app-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
</style>
