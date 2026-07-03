<template>
  <div class="application-detail">
    <el-card v-if="application" v-loading="loading">
      <div class="detail-header">
        <div>
          <h2>{{ application.jobTitle }}</h2>
          <el-tag :type="getStatusType(application.status)" size="large">
            {{ getStatusText(application.status) }}
          </el-tag>
        </div>
        <el-select v-model="newStatus" @change="updateStatus" :disabled="statusLoading">
          <el-option label="待筛选" value="pending" />
          <el-option label="已沟通" value="contacted" />
          <el-option label="面试中" value="interviewing" />
          <el-option label="已拒绝" value="rejected" />
        </el-select>
      </div>

      <div class="section">
        <h3 class="section-title">候选人信息</h3>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="姓名">{{ application.candidateName }}</el-descriptions-item>
          <el-descriptions-item label="电话">{{ application.phone }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ application.email }}</el-descriptions-item>
          <el-descriptions-item label="学历">{{ application.education }}</el-descriptions-item>
          <el-descriptions-item label="工作经验">{{ application.experience }}</el-descriptions-item>
          <el-descriptions-item label="期望薪资">{{ application.expectSalary }}</el-descriptions-item>
          <el-descriptions-item label="技能" :span="2">{{ application.skills }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <div class="section">
        <h3 class="section-title">简历内容</h3>
        <div class="resume-content">{{ application.resume }}</div>
      </div>

      <div class="section">
        <h3 class="section-title">处理时间线</h3>
        <div class="timeline">
          <div
            v-for="(item, index) in (application.timeline || [])"
            :key="index"
            :class="['timeline-item', item.status]"
          >
            <div class="timeline-dot" :class="item.status"></div>
            <div class="timeline-content">
              <div class="timeline-action">{{ item.action }}</div>
              <div class="timeline-time">{{ formatTime(item.time) }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <h3 class="section-title">沟通消息</h3>
        <div class="message-list">
          <div
            v-for="message in messageList"
            :key="message.id"
            :class="['message-item', message.senderType]"
          >
            <div class="message-avatar">
              {{ message.senderType === 'recruiter' ? 'HR' : '候选人' }}
            </div>
            <div class="message-content">
              <div class="message-header">
                <span class="sender-name">{{ message.senderType === 'recruiter' ? '招聘方' : '候选人' }}</span>
                <span class="send-time">{{ formatTime(message.createdAt) }}</span>
              </div>
              <p>{{ message.content }}</p>
            </div>
          </div>
        </div>
        <div class="message-input">
          <el-input
            v-model="newMessage"
            placeholder="输入消息内容"
            @keyup.enter="sendMessage"
            :disabled="messageLoading"
          >
            <template #append>
              <el-button @click="sendMessage" :loading="messageLoading">发送</el-button>
            </template>
          </el-input>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { applicationApi, messageApi } from '../api'

const route = useRoute()
const application = ref(null)
const newStatus = ref('')
const messageList = ref([])
const newMessage = ref('')
const loading = ref(false)
const statusLoading = ref(false)
const messageLoading = ref(false)

const fetchApplication = async () => {
  loading.value = true
  try {
    const res = await applicationApi.get(route.params.id)
    if (res.data.code === 200) {
      application.value = res.data.data
      newStatus.value = res.data.data.status
      await fetchMessages()
    } else {
      ElMessage.error(res.data.message || '获取投递详情失败')
    }
  } catch (error) {
    console.error('获取投递详情失败:', error)
    const msg = error.response?.data?.message || '获取投递详情失败'
    ElMessage.error(msg)
  } finally {
    loading.value = false
  }
}

const fetchMessages = async () => {
  if (!application.value) return
  try {
    const res = await messageApi.list(application.value.id)
    if (res.data.code === 200) {
      messageList.value = res.data.data
    }
  } catch (error) {
    console.error('获取消息列表失败:', error)
  }
}

const updateStatus = async () => {
  if (!application.value || application.value.status === newStatus.value) return
  statusLoading.value = true
  try {
    const res = await applicationApi.updateStatus(application.value.id, newStatus.value)
    if (res.data.code === 200) {
      await fetchApplication()
      ElMessage.success('状态更新成功')
    } else {
      ElMessage.error(res.data.message || '状态更新失败')
      newStatus.value = application.value.status
    }
  } catch (error) {
    console.error('状态更新失败:', error)
    const msg = error.response?.data?.message || '状态更新失败'
    ElMessage.error(msg)
    newStatus.value = application.value.status
  } finally {
    statusLoading.value = false
  }
}

const sendMessage = async () => {
  if (!newMessage.value.trim()) return
  messageLoading.value = true
  try {
    const res = await messageApi.create({
      applicationId: application.value.id,
      senderType: 'recruiter',
      content: newMessage.value.trim()
    })
    if (res.data.code === 200) {
      messageList.value.push(res.data.data)
      newMessage.value = ''
      ElMessage.success('消息发送成功')
    } else {
      ElMessage.error(res.data.message || '消息发送失败')
    }
  } catch (error) {
    console.error('消息发送失败:', error)
    const msg = error.response?.data?.message || '消息发送失败'
    ElMessage.error(msg)
  } finally {
    messageLoading.value = false
  }
}

const getStatusText = (status) => {
  const map = {
    pending: '待筛选',
    contacted: '已沟通',
    interviewing: '面试中',
    rejected: '已拒绝'
  }
  return map[status] || status
}

const getStatusType = (status) => {
  const map = {
    pending: 'info',
    contacted: 'success',
    interviewing: 'warning',
    rejected: 'danger'
  }
  return map[status] || 'info'
}

const formatTime = (time) => {
  if (!time) return ''
  return new Date(time).toLocaleString('zh-CN')
}

onMounted(() => {
  fetchApplication()
})
</script>

<style scoped>
.application-detail {
  padding: 20px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.detail-header h2 {
  font-size: 24px;
  color: #303133;
  margin-bottom: 8px;
}

.section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 12px;
}

.resume-content {
  background-color: #f5f7fa;
  padding: 16px;
  border-radius: 8px;
  color: #606266;
  line-height: 1.8;
}

.message-list {
  background-color: #f5f7fa;
  padding: 16px;
  border-radius: 8px;
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 16px;
}

.message-item {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.message-item.recruiter {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #409eff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}

.message-item.recruiter .message-avatar {
  background-color: #67c23a;
}

.message-content {
  max-width: 70%;
}

.message-item.recruiter .message-content {
  text-align: right;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.message-item.recruiter .message-header {
  flex-direction: row-reverse;
}

.sender-name {
  font-size: 12px;
  color: #909399;
}

.send-time {
  font-size: 12px;
  color: #c0c4cc;
}

.message-content p {
  background-color: white;
  padding: 10px 14px;
  border-radius: 8px;
  margin: 0;
  color: #303133;
}

.message-item.recruiter .message-content p {
  background-color: #409eff;
  color: white;
}

.message-input {
  margin-top: 16px;
}

.timeline {
  position: relative;
  padding-left: 24px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 8px;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: #e4e7ed;
}

.timeline-item {
  position: relative;
  padding-bottom: 20px;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-dot {
  position: absolute;
  left: -20px;
  top: 4px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #409eff;
  border: 2px solid white;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.timeline-dot.pending {
  background-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.timeline-dot.contacted {
  background-color: #67c23a;
  box-shadow: 0 0 0 2px rgba(103, 194, 58, 0.2);
}

.timeline-dot.interviewing {
  background-color: #e6a23c;
  box-shadow: 0 0 0 2px rgba(230, 162, 60, 0.2);
}

.timeline-dot.rejected {
  background-color: #f56c6c;
  box-shadow: 0 0 0 2px rgba(245, 108, 108, 0.2);
}

.timeline-content {
  padding-left: 16px;
}

.timeline-action {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.timeline-time {
  font-size: 12px;
  color: #909399;
}
</style>
