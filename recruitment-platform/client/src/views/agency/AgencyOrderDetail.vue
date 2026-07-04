<template>
  <div class="order-detail">
    <div class="detail-nav">
      <el-button link @click="$router.push('/agency/orders')">← 返回订单列表</el-button>
    </div>

    <el-card v-loading="loading">
      <template v-if="loadError">
        <el-empty :description="loadError">
          <el-button type="primary" @click="fetchOrder">重新加载</el-button>
          <el-button @click="$router.push('/agency/orders')">返回列表</el-button>
        </el-empty>
      </template>
      <template v-else-if="order">
        <div class="detail-header">
          <div class="header-left">
            <div class="header-sub">
              <el-tag size="small" type="info">{{ order.profession }}</el-tag>
              <span class="order-no">订单号：#{{ order.id }}</span>
            </div>
            <h2>{{ order.workerName }} → {{ order.customerName }}</h2>
            <p class="header-time">下单时间：{{ formatTime(order.createdAt) }}</p>
            <el-tag :type="getStatusType(order.status)" size="large">
              {{ getStatusLabel(order.status) }}
            </el-tag>
          </div>
          <div class="header-actions">
            <el-select
              v-model="newStatus"
              placeholder="更新状态"
              style="width: 160px"
              :disabled="isTerminal || statusLoading"
              @change="updateStatus"
            >
              <el-option label="待确认" value="pending" :disabled="order.status === 'pending'" />
              <el-option label="已确认" value="confirmed" :disabled="!canTransitionTo('confirmed')" />
              <el-option label="进行中" value="in_progress" :disabled="!canTransitionTo('in_progress')" />
              <el-option label="已完成" value="completed" :disabled="!canTransitionTo('completed')" />
              <el-option label="已取消" value="cancelled" :disabled="!canTransitionTo('cancelled')" />
            </el-select>
          </div>
        </div>

        <el-alert
          v-if="isTerminal"
          class="terminal-alert"
          :title="`订单已${getStatusLabel(order.status)}，不可再变更`"
          :type="order.status === 'completed' ? 'success' : 'warning'"
          :closable="false"
          show-icon
        />

        <el-row :gutter="20">
          <el-col :span="14">
            <div class="section">
              <h3 class="section-title">服务信息</h3>
              <div class="info-grid">
                <div class="info-row"><span class="label">服务人员：</span>{{ order.workerName }}</div>
                <div class="info-row"><span class="label">服务职业：</span>{{ order.profession }}</div>
                <div class="info-row"><span class="label">客户姓名：</span>{{ order.customerName }}</div>
                <div class="info-row"><span class="label">客户电话：</span>{{ order.customerPhone }}</div>
                <div class="info-row"><span class="label">服务地址：</span>{{ order.customerAddress }}</div>
                <div class="info-row" v-if="order.scheduledTime"><span class="label">预约时间：</span>{{ formatTime(order.scheduledTime) }}</div>
                <div class="info-row"><span class="label">预算：</span>{{ order.budget || '面议' }}</div>
              </div>
            </div>
            <div class="section">
              <h3 class="section-title">需求描述</h3>
              <p class="section-content">{{ order.description }}</p>
            </div>
            <div class="section">
              <h3 class="section-title">处理时间线</h3>
              <el-timeline>
                <el-timeline-item
                  v-for="(item, idx) in order.timeline"
                  :key="idx"
                  :timestamp="formatTime(item.time)"
                  :type="getStatusType(item.status)"
                >
                  <strong>{{ getStatusLabel(item.status) }}</strong> - {{ item.action }}
                </el-timeline-item>
              </el-timeline>
            </div>
          </el-col>
          <el-col :span="10">
            <div class="section">
              <div class="section-head">
                <h3 class="section-title" style="margin-bottom: 0">沟通消息</h3>
              </div>
              <div class="message-list">
                <div v-if="messageList.length === 0" class="empty-inline">暂无消息，开始沟通吧</div>
                <div
                  v-for="msg in messageList"
                  :key="msg.id"
                  class="message-item"
                  :class="msg.senderType"
                >
                  <div class="message-sender">{{ getSenderLabel(msg.senderType) }}</div>
                  <div class="message-content">{{ msg.content }}</div>
                  <div class="message-time">{{ formatTime(msg.createdAt) }}</div>
                </div>
              </div>
              <div v-if="!isTerminal" class="message-input">
                <el-input
                  v-model="newMessage"
                  type="textarea"
                  :rows="3"
                  placeholder="输入消息内容"
                />
                <div class="message-actions">
                  <el-select v-model="senderType" size="small" style="width: 110px">
                    <el-option label="客户" value="customer" />
                    <el-option label="服务人员" value="worker" />
                    <el-option label="平台" value="platform" />
                  </el-select>
                  <el-button type="primary" size="small" :loading="messageLoading" @click="sendMessage">
                    发送
                  </el-button>
                </div>
              </div>
              <el-alert
                v-else
                type="info"
                :closable="false"
                title="订单已结束，不可再发送消息"
                show-icon
                style="margin-top: 12px"
              />
            </div>
          </el-col>
        </el-row>
      </template>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { agencyApi } from '../../api'

const route = useRoute()
const router = useRouter()
const refreshUnreadCount = inject('refreshUnreadCount', () => {})

const order = ref(null)
const loading = ref(false)
const loadError = ref('')
const newStatus = ref('')

const messageList = ref([])
const newMessage = ref('')
const senderType = ref('customer')
const messageLoading = ref(false)
const statusLoading = ref(false)

const isTerminal = computed(() =>
  order.value && ['completed', 'cancelled'].includes(order.value.status)
)

const STATUS_FLOW = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed: [],
  cancelled: []
}

const canTransitionTo = (target) => {
  if (!order.value) return false
  const allowed = STATUS_FLOW[order.value.status] || []
  return allowed.includes(target)
}

const fetchOrder = async () => {
  loading.value = true
  loadError.value = ''
  try {
    const res = await agencyApi.getOrder(route.params.id)
    if (res.data.code === 200) {
      order.value = res.data.data
      newStatus.value = res.data.data.status
      await fetchMessages()
    } else {
      loadError.value = res.data.message || '获取订单详情失败'
    }
  } catch (e) {
    console.error('获取订单失败:', e)
    loadError.value = '网络异常，获取订单详情失败'
  } finally {
    loading.value = false
  }
}

const fetchMessages = async () => {
  if (!order.value) return
  try {
    const res = await agencyApi.listOrderMessages(order.value.id)
    if (res.data.code === 200) {
      messageList.value = res.data.data
    }
  } catch (e) {
    console.error('获取消息失败:', e)
  }
}

const updateStatus = async (status) => {
  if (!order.value || !status) return
  if (status === order.value.status) return

  try {
    await ElMessageBox.confirm(
      `确认将订单状态变更为「${getStatusLabel(status)}」？`,
      '状态变更确认',
      { confirmButtonText: '确认', cancelButtonText: '取消', type: 'warning' }
    )
  } catch {
    newStatus.value = order.value.status
    return
  }

  statusLoading.value = true
  try {
    const res = await agencyApi.updateOrderStatus(order.value.id, status)
    if (res.data.code === 200) {
      order.value = res.data.data
      newStatus.value = res.data.data.status
      ElMessage.success('状态更新成功')
      refreshUnreadCount()
    } else {
      ElMessage.error(res.data.message || '状态更新失败')
      newStatus.value = order.value.status
    }
  } catch (e) {
    console.error('状态更新失败:', e)
    const msg = e.response?.data?.message || '状态更新失败'
    ElMessage.error(msg)
    newStatus.value = order.value.status
  } finally {
    statusLoading.value = false
  }
}

const sendMessage = async () => {
  if (!newMessage.value.trim()) {
    ElMessage.warning('请输入消息内容')
    return
  }
  messageLoading.value = true
  try {
    const res = await agencyApi.sendOrderMessage(order.value.id, {
      senderType: senderType.value,
      content: newMessage.value
    })
    if (res.data.code === 200) {
      messageList.value.push(res.data.data)
      newMessage.value = ''
      ElMessage.success('消息发送成功')
      refreshUnreadCount()
    } else {
      ElMessage.error(res.data.message || '消息发送失败')
    }
  } catch (e) {
    console.error('发送消息失败:', e)
    const msg = e.response?.data?.message || '消息发送失败'
    ElMessage.error(msg)
  } finally {
    messageLoading.value = false
  }
}

const getStatusLabel = (s) => ({
  pending: '待确认', confirmed: '已确认', in_progress: '进行中',
  completed: '已完成', cancelled: '已取消'
}[s] || s)

const getStatusType = (s) => ({
  pending: 'info', confirmed: 'success', in_progress: 'warning',
  completed: 'success', cancelled: 'danger'
}[s] || 'info')

const getSenderLabel = (s) => ({
  customer: '客户', worker: '服务人员', platform: '平台'
}[s] || s)

const formatTime = (t) => {
  if (!t) return ''
  return new Date(t).toLocaleString('zh-CN')
}

onMounted(() => {
  fetchOrder()
})
</script>

<style scoped>
.order-detail {
  padding: 0;
}

.detail-nav {
  margin-bottom: 12px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 20px;
}

.header-sub {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.order-no {
  font-size: 13px;
  color: #909399;
}

.detail-header h2 {
  font-size: 22px;
  margin: 4px 0 8px;
  color: #303133;
}

.header-time {
  font-size: 13px;
  color: #909399;
  margin: 0 0 12px;
}

.terminal-alert {
  margin-bottom: 20px;
}

.section {
  margin-bottom: 24px;
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px;
  padding-left: 10px;
  border-left: 3px solid #409eff;
}

.info-grid {
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 16px;
}

.info-row {
  margin: 8px 0;
  color: #606266;
  line-height: 1.8;
}

.label {
  color: #909399;
}

.section-content {
  color: #606266;
  line-height: 1.8;
  margin: 0;
  background-color: #f5f7fa;
  padding: 16px;
  border-radius: 8px;
}

.message-list {
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 12px;
  max-height: 360px;
  overflow-y: auto;
  margin-bottom: 12px;
}

.empty-inline {
  text-align: center;
  padding: 24px 0;
  color: #909399;
}

.message-item {
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 8px;
  background-color: #fff;
}

.message-item.customer {
  border-left: 3px solid #409eff;
}

.message-item.worker {
  border-left: 3px solid #67c23a;
}

.message-item.platform {
  border-left: 3px solid #e6a23c;
}

.message-sender {
  font-size: 12px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.message-content {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 4px;
}

.message-time {
  font-size: 12px;
  color: #c0c4cc;
}

.message-input {
  margin-top: 12px;
}

.message-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}
</style>
