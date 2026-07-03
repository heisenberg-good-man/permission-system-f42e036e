<template>
  <div class="not-found">
    <el-card class="error-card">
      <div class="error-icon">
        <el-icon size="64" color="#409eff"><Warning /></el-icon>
      </div>
      <h1 class="error-code">{{ errorCode }}</h1>
      <p class="error-title">{{ errorTitle }}</p>
      <p class="error-desc">{{ errorDesc }}</p>
      <div class="error-actions">
        <el-button type="primary" @click="goHome">回到职位列表</el-button>
        <el-button @click="goCandidates">候选人列表</el-button>
        <el-button @click="goStatistics">统计概览</el-button>
      </div>
      <div v-if="showBack" class="error-back">
        <el-button link @click="$router.back()">返回上一页</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Warning } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const errorCode = computed(() => route.meta?.code || 404)
const errorTitle = computed(() => route.meta?.title || '页面不存在')
const errorDesc = computed(() => route.meta?.desc || '您访问的页面不存在或已被移除')
const showBack = computed(() => route.meta?.showBack !== false)

const goHome = () => router.push('/')
const goCandidates = () => router.push('/candidates')
const goStatistics = () => router.push('/statistics')
</script>

<style scoped>
.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 40px 20px;
}

.error-card {
  max-width: 520px;
  width: 100%;
  text-align: center;
}

.error-icon {
  margin-bottom: 16px;
}

.error-code {
  font-size: 72px;
  font-weight: bold;
  color: #409eff;
  margin: 0 0 12px;
  line-height: 1;
}

.error-title {
  font-size: 22px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px;
}

.error-desc {
  font-size: 14px;
  color: #909399;
  margin: 0 0 28px;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.error-back {
  margin-top: 16px;
}
</style>
