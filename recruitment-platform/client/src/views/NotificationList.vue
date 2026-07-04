<template>
  <div class="notification-list">
    <div class="page-header">
      <div class="header-left">
        <h2>通知中心</h2>
        <span class="unread-tip" v-if="summary.unreadCount > 0">
          您有 <strong>{{ summary.unreadCount }}</strong> 条未读提醒
        </span>
        <span class="unread-tip muted" v-else>暂无未读提醒</span>
      </div>
      <div class="header-right">
        <el-button type="primary" :disabled="summary.unreadCount === 0" @click="handleMarkAllRead">
          全部标记已读
        </el-button>
        <el-button @click="refreshAll">刷新</el-button>
      </div>
    </div>

    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filters" class="filter-form">
        <el-form-item label="接收角色">
          <el-select v-model="filters.role" placeholder="全部角色" clearable style="width: 140px">
            <el-option v-for="r in roleOptions" :key="r.value" :label="r.label" :value="r.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="提醒类型">
          <el-select v-model="filters.type" placeholder="全部类型" clearable style="width: 160px">
            <el-option v-for="t in typeOptions" :key="t.value" :label="t.label" :value="t.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="已读状态">
          <el-select v-model="filters.isRead" placeholder="全部状态" clearable style="width: 120px">
            <el-option label="未读" value="false" />
            <el-option label="已读" value="true" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="filters.priority" placeholder="全部优先级" clearable style="width: 120px">
            <el-option label="高" value="high" />
            <el-option label="普通" value="normal" />
            <el-option label="低" value="low" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="filters.keyword" placeholder="标题/内容关键词" clearable style="width: 200px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="list-card">
      <div v-loading="loading">
        <div v-if="list.length === 0 && !loading" class="empty-wrap">
          <el-empty description="暂无提醒通知">
            <el-button type="primary" @click="handleReset">清空筛选条件</el-button>
          </el-empty>
        </div>

        <div v-else class="notice-items">
          <div
            v-for="item in list"
            :key="item.id"
            class="notice-item"
            :class="{ unread: !item.isRead }"
          >
            <div class="notice-dot" :class="`dot-${item.priority}`"></div>
            <div class="notice-main">
              <div class="notice-title-row">
                <span class="notice-title">{{ item.title }}</span>
                <el-tag size="small" :type="typeTagType(item.type)" effect="plain">{{ typeLabel(item.type) }}</el-tag>
                <el-tag size="small" :type="roleTagType(item.role)" effect="plain">{{ roleLabel(item.role) }}</el-tag>
                <el-tag v-if="item.priority === 'high'" size="small" type="danger">高优先级</el-tag>
                <el-tag v-if="!item.isRead" size="small" type="warning">未读</el-tag>
                <el-tag v-else size="small" type="info">已读</el-tag>
              </div>
              <div class="notice-content">{{ item.content }}</div>
              <div class="notice-meta">
                <span class="meta-time">触发时间：{{ formatTime(item.triggerTime) }}</span>
                <span v-if="!item.targetExists" class="target-missing">
                  <el-icon><WarningFilled /></el-icon>
                  关联目标已不存在
                </span>
              </div>
            </div>
            <div class="notice-actions">
              <el-button
                size="small"
                type="primary"
                :disabled="!item.targetExists"
                @click="handleJump(item)"
              >
                查看详情
              </el-button>
              <el-button
                v-if="!item.isRead"
                size="small"
                @click="handleMarkRead(item)"
              >
                标记已读
              </el-button>
              <el-button
                size="small"
                type="info"
                plain
                @click="handleIgnore(item)"
              >
                忽略
              </el-button>
            </div>
          </div>
        </div>

        <div v-if="total > 0" class="pagination-wrap">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.size"
            :total="total"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="fetchList"
            @current-change="fetchList"
          />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { WarningFilled } from '@element-plus/icons-vue'
import { notificationApi } from '../api'

const router = useRouter()
const refreshUnreadCount = inject('refreshUnreadCount', () => {})

const loading = ref(false)
const list = ref([])
const total = ref(0)
const summary = ref({ unreadCount: 0, total: 0, readCount: 0 })

const filters = reactive({
  role: '',
  type: '',
  isRead: '',
  priority: '',
  keyword: ''
})

const pagination = reactive({ page: 1, size: 10 })

const roleOptions = [
  { value: 'recruiter', label: '招聘方' },
  { value: 'candidate', label: '应聘方' },
  { value: 'interviewer', label: '面试官' },
  { value: 'hiring_manager', label: '招聘负责人' }
]

const typeOptions = [
  { value: 'new_application', label: '新投递' },
  { value: 'status_change', label: '状态变更' },
  { value: 'interview_scheduled', label: '面试安排' },
  { value: 'interview_rescheduled', label: '面试改期' },
  { value: 'feedback_pending', label: '待填反馈' },
  { value: 'feedback_submitted', label: '反馈结果' },
  { value: 'offer_pending', label: 'Offer待确认' },
  { value: 'hiring_request_result', label: '需求审批' }
]

const ROLE_LABELS = {
  recruiter: '招聘方',
  candidate: '应聘方',
  interviewer: '面试官',
  hiring_manager: '招聘负责人'
}

const TYPE_LABELS = {
  new_application: '新投递',
  status_change: '状态变更',
  interview_scheduled: '面试安排',
  interview_rescheduled: '面试改期',
  feedback_pending: '待填反馈',
  feedback_submitted: '反馈结果',
  offer_pending: 'Offer待确认',
  hiring_request_result: '需求审批'
}

const roleLabel = (r) => ROLE_LABELS[r] || r
const typeLabel = (t) => TYPE_LABELS[t] || t

const roleTagType = (r) => ({
  recruiter: 'primary',
  candidate: 'success',
  interviewer: 'warning',
  hiring_manager: 'danger'
}[r] || 'info')

const typeTagType = (t) => ({
  new_application: 'primary',
  status_change: 'info',
  interview_scheduled: 'warning',
  interview_rescheduled: 'warning',
  feedback_pending: 'warning',
  feedback_submitted: 'success',
  offer_pending: 'danger',
  hiring_request_result: 'info'
}[t] || 'info')

const formatTime = (iso) => {
  if (!iso) return '-'
  const d = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const buildParams = () => {
  const p = { page: pagination.page, size: pagination.size }
  if (filters.role) p.role = filters.role
  if (filters.type) p.type = filters.type
  if (filters.isRead !== '') p.isRead = filters.isRead
  if (filters.priority) p.priority = filters.priority
  if (filters.keyword) p.keyword = filters.keyword
  return p
}

const fetchList = async () => {
  loading.value = true
  try {
    const res = await notificationApi.list(buildParams())
    if (res.data.code === 200) {
      list.value = res.data.data.list
      total.value = res.data.data.total
    } else {
      ElMessage.error(res.data.message || '获取通知列表失败')
    }
  } catch (e) {
    ElMessage.error('获取通知列表失败，请检查网络或后端服务')
  } finally {
    loading.value = false
  }
}

const fetchSummary = async () => {
  try {
    const res = await notificationApi.summary()
    if (res.data.code === 200) {
      summary.value = res.data.data
    }
  } catch (e) {
    // 静默
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchList()
}

const handleReset = () => {
  filters.role = ''
  filters.type = ''
  filters.isRead = ''
  filters.priority = ''
  filters.keyword = ''
  pagination.page = 1
  fetchList()
}

const refreshAll = async () => {
  await Promise.all([fetchList(), fetchSummary()])
  refreshUnreadCount()
}

const handleMarkRead = async (item) => {
  try {
    const res = await notificationApi.markRead(item.id)
    if (res.data.code === 200) {
      ElMessage.success(res.data.message || '已标记为已读')
      item.isRead = true
      await fetchSummary()
      refreshUnreadCount()
    } else {
      ElMessage.warning(res.data.message || '操作失败')
    }
  } catch (e) {
    ElMessage.error('标记已读失败')
  }
}

const handleMarkAllRead = async () => {
  try {
    const res = await notificationApi.markAllRead()
    if (res.data.code === 200) {
      ElMessage.success(res.data.message || '已全部标记为已读')
      await refreshAll()
    } else {
      ElMessage.warning(res.data.message || '操作失败')
    }
  } catch (e) {
    ElMessage.error('全部标记已读失败')
  }
}

const handleIgnore = async (item) => {
  try {
    await ElMessageBox.confirm('确认忽略该提醒？忽略后将不再出现在通知列表中。', '忽略提醒', {
      type: 'warning',
      confirmButtonText: '确认忽略',
      cancelButtonText: '取消'
    })
  } catch {
    return
  }
  try {
    const res = await notificationApi.ignore(item.id)
    if (res.data.code === 200) {
      ElMessage.success(res.data.message || '已忽略')
      await refreshAll()
    } else {
      ElMessage.warning(res.data.message || '操作失败')
    }
  } catch (e) {
    ElMessage.error('忽略提醒失败')
  }
}

const handleJump = async (item) => {
  // 跳转前若目标已不存在，按钮已禁用；这里再防御性检查
  if (!item.targetExists) {
    ElMessage.warning('关联目标已不存在，无法跳转')
    return
  }
  // 未读的提醒点击跳转时顺带标记为已读
  if (!item.isRead) {
    try {
      await notificationApi.markRead(item.id)
      item.isRead = true
      await fetchSummary()
      refreshUnreadCount()
    } catch (e) {
      // 标记失败不阻断跳转
    }
  }
  router.push(item.linkUrl)
}

onMounted(() => {
  fetchList()
  fetchSummary()
})
</script>

<style scoped>
.notification-list {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.header-left {
  display: flex;
  align-items: baseline;
  gap: 16px;
}

.page-header h2 {
  font-size: 22px;
  color: #303133;
}

.unread-tip {
  font-size: 14px;
  color: #606266;
}

.unread-tip strong {
  color: #f56c6c;
}

.unread-tip.muted {
  color: #909399;
}

.header-right {
  display: flex;
  gap: 8px;
}

.filter-card {
  margin-bottom: 16px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 0;
}

.list-card {
  min-height: 400px;
}

.empty-wrap {
  padding: 40px 0;
}

.notice-items {
  display: flex;
  flex-direction: column;
}

.notice-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
}

.notice-item:hover {
  background-color: #f9fafc;
}

.notice-item.unread {
  background-color: #fffbe6;
}

.notice-item.unread:hover {
  background-color: #fff7cc;
}

.notice-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
}

.dot-high {
  background-color: #f56c6c;
}

.dot-normal {
  background-color: #409eff;
}

.dot-low {
  background-color: #c0c4cc;
}

.notice-main {
  flex: 1;
  min-width: 0;
}

.notice-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.notice-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.notice-item.unread .notice-title {
  color: #d48806;
}

.notice-content {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 8px;
}

.notice-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 12px;
  color: #909399;
}

.target-missing {
  color: #f56c6c;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.notice-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  padding: 16px 0 0;
}
</style>
