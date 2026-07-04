<template>
  <div class="application-detail">
    <div class="detail-nav">
      <el-button @click="$router.back()">← 返回</el-button>
    </div>
    <el-card v-loading="loading">
      <template v-if="application">
        <div class="detail-header">
          <div>
            <div class="header-sub">
              <el-tag size="small" type="info">{{ application.source || '官网投递' }}</el-tag>
              <span class="owner-text">负责人：{{ application.owner || '未分配' }}</span>
            </div>
            <h2>{{ application.candidateName }}</h2>
            <p class="header-job" @click="goJobDetail" style="cursor: pointer; color: #409eff; margin: 4px 0 8px 0; font-size: 14px;">
              投递职位：{{ application.jobTitle }} →
            </p>
            <el-tag :type="getStatusType(application.status)" size="large">
              {{ getStatusText(application.status) }}
            </el-tag>
          </div>
          <div class="header-actions">
            <el-select v-model="newStatus" @change="updateStatus" :disabled="statusLoading" style="width: 160px">
              <el-option label="待筛选" value="pending" />
              <el-option label="已沟通" value="contacted" />
              <el-option label="面试中" value="interviewing" />
              <el-option label="已发 Offer" value="offered" />
              <el-option label="已淘汰" value="rejected" />
            </el-select>
          </div>
        </div>

        <div class="section">
          <div class="section-head">
            <h3 class="section-title">候选人信息</h3>
            <el-button size="small" type="primary" link @click="editOwner">更换负责人</el-button>
          </div>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="姓名">{{ application.candidateName }}</el-descriptions-item>
            <el-descriptions-item label="电话">{{ application.phone }}</el-descriptions-item>
            <el-descriptions-item label="邮箱">{{ application.email }}</el-descriptions-item>
            <el-descriptions-item label="学历">{{ application.education }}</el-descriptions-item>
            <el-descriptions-item label="工作经验">{{ application.experience }}</el-descriptions-item>
            <el-descriptions-item label="期望薪资">{{ application.expectSalary }}</el-descriptions-item>
            <el-descriptions-item label="来源">{{ application.source || '—' }}</el-descriptions-item>
            <el-descriptions-item label="负责人">{{ application.owner || '未分配' }}</el-descriptions-item>
            <el-descriptions-item label="技能" :span="2">{{ application.skills }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="section">
          <div class="section-head">
            <h3 class="section-title">简历摘要</h3>
            <el-button size="small" type="primary" link @click="scrollToResume">查看完整简历</el-button>
          </div>
          <div class="resume-summary">
            <p>{{ resumeSummary }}</p>
          </div>
        </div>

        <div class="section" id="resume-full">
          <h3 class="section-title">简历内容</h3>
          <div class="resume-content">{{ application.resume }}</div>
        </div>

        <div class="section">
          <div class="section-head">
            <h3 class="section-title">招聘备注</h3>
            <el-button size="small" type="primary" link @click="editNotes" :disabled="notesLoading">
              {{ notesEditing ? '取消' : '编辑备注' }}
            </el-button>
          </div>
          <div v-if="!notesEditing" class="notes-display">
            <p v-if="application.notes">{{ application.notes }}</p>
            <p v-else class="notes-empty">暂无备注，点击「编辑备注」添加</p>
          </div>
          <div v-else class="notes-edit">
            <el-input
              v-model="notesDraft"
              type="textarea"
              :rows="4"
              placeholder="输入备注内容，例如候选人特点、沟通要点、待跟进事项等"
              maxlength="500"
              show-word-limit
            />
            <div class="notes-actions">
              <el-button size="small" @click="cancelNotes">取消</el-button>
              <el-button size="small" type="primary" :loading="notesSaving" @click="saveNotes">保存备注</el-button>
            </div>
          </div>
        </div>

        <div class="section">
          <h3 class="section-title">处理时间线</h3>
          <div v-if="(application.timeline || []).length === 0" class="empty-inline">
            暂无时间线记录
          </div>
          <div v-else class="timeline">
            <div
              v-for="(item, index) in application.timeline"
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
          <div class="section-head">
            <h3 class="section-title">面试安排</h3>
            <el-button
              size="small"
              type="primary"
              @click="openArrangeDialog"
              :disabled="isTerminalStatus"
            >
              安排面试
            </el-button>
          </div>
          <el-table :data="interviewList" style="width: 100%" empty-text="暂无面试安排">
            <el-table-column label="轮次" width="80">
              <template #default="scope">{{ scope.row.roundName }}</template>
            </el-table-column>
            <el-table-column prop="interviewer" label="面试官" width="120" />
            <el-table-column label="面试时间" width="180">
              <template #default="scope">{{ formatTime(scope.row.scheduledTime) }}</template>
            </el-table-column>
            <el-table-column prop="location" label="地点" />
            <el-table-column label="面试状态" width="100">
              <template #default="scope">
                <el-tag :type="getInterviewStatusType(scope.row.status)">
                  {{ getInterviewStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="反馈状态" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.feedbackStatus === 'submitted' ? 'success' : 'info'">
                  {{ scope.row.feedbackStatus === 'submitted' ? '已反馈' : '待反馈' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="scope">
                <el-button size="small" @click="$router.push(`/interview/${scope.row.id}`)">
                  {{ scope.row.feedbackStatus === 'submitted' ? '查看反馈' : '填写反馈' }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="section">
          <h3 class="section-title">沟通消息</h3>
          <div v-if="messageList.length === 0" class="empty-inline">
            暂无沟通消息，输入下方内容开始沟通
          </div>
          <div v-else class="message-list">
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
              type="textarea"
              :rows="2"
              placeholder="输入消息内容，按 Ctrl+Enter 发送"
              @keydown.ctrl.enter="sendMessage"
              :disabled="messageLoading"
            />
            <div class="message-actions">
              <el-button type="primary" @click="sendMessage" :loading="messageLoading">发送消息</el-button>
            </div>
          </div>
        </div>

        <el-dialog v-model="arrangeDialogVisible" title="安排面试" width="480px">
          <el-form :model="arrangeForm" label-width="90px">
            <el-form-item label="面试轮次" required>
              <el-select v-model="arrangeForm.round" placeholder="选择轮次" class="arrange-select">
                <el-option label="初试" :value="1" />
                <el-option label="复试" :value="2" />
                <el-option label="终试" :value="3" />
              </el-select>
            </el-form-item>
            <el-form-item label="面试官" required>
              <el-input v-model="arrangeForm.interviewer" placeholder="请输入面试官姓名" />
            </el-form-item>
            <el-form-item label="面试时间" required>
              <el-date-picker
                v-model="arrangeForm.scheduledTime"
                type="datetime"
                placeholder="选择面试时间"
                value-format="YYYY-MM-DDTHH:mm:ss"
                class="arrange-select"
              />
            </el-form-item>
            <el-form-item label="面试地点">
              <el-input v-model="arrangeForm.location" placeholder="现场/视频会议链接等" />
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="arrangeDialogVisible = false">取消</el-button>
            <el-button type="primary" :loading="arrangeLoading" @click="arrangeInterview">确定安排</el-button>
          </template>
        </el-dialog>
      </template>
      <template v-else-if="loadError">
        <el-empty :description="loadError">
          <el-button type="primary" @click="fetchApplication">重新加载</el-button>
          <el-button @click="goCandidates">候选人列表</el-button>
          <el-button @click="goJobs">职位列表</el-button>
          <el-button @click="$router.back()">返回上一页</el-button>
        </el-empty>
      </template>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { applicationApi, messageApi, interviewApi } from '../api'

const route = useRoute()
const router = useRouter()
const refreshUnreadCount = inject('refreshUnreadCount', () => {})
const application = ref(null)
const newStatus = ref('')
const messageList = ref([])
const newMessage = ref('')
const loading = ref(false)
const loadError = ref('')
const statusLoading = ref(false)
const messageLoading = ref(false)

const notesEditing = ref(false)
const notesDraft = ref('')
const notesSaving = ref(false)
const notesLoading = ref(false)

const interviewList = ref([])
const arrangeDialogVisible = ref(false)
const arrangeLoading = ref(false)
const arrangeForm = ref({
  round: 1,
  interviewer: '',
  scheduledTime: '',
  location: '视频会议'
})

const STATUS_LABELS = {
  pending: '待筛选',
  contacted: '已沟通',
  interviewing: '面试中',
  offered: '已发 Offer',
  rejected: '已淘汰'
}

const resumeSummary = computed(() => {
  if (!application.value || !application.value.resume) return '暂无简历内容'
  const text = application.value.resume
  return text.length > 100 ? text.slice(0, 100) + '...' : text
})

const isTerminalStatus = computed(() => {
  if (!application.value) return false
  return application.value.status === 'rejected' || application.value.status === 'offered'
})

const goCandidates = () => router.push('/candidates')
const goJobs = () => router.push('/')
const goJobDetail = () => {
  if (application.value) {
    router.push(`/job/${application.value.jobId}`)
  }
}

const scrollToResume = () => {
  const el = document.getElementById('resume-full')
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

const fetchApplication = async () => {
  loading.value = true
  loadError.value = ''
  try {
    const res = await applicationApi.get(route.params.id)
    if (res.data.code === 200) {
      application.value = res.data.data
      newStatus.value = res.data.data.status
      notesDraft.value = res.data.data.notes || ''
      await Promise.all([fetchMessages(), fetchInterviews()])
    } else {
      loadError.value = res.data.message || '获取投递详情失败'
    }
  } catch (error) {
    console.error('获取投递详情失败:', error)
    const msg = error.response?.data?.message || '获取投递详情失败，请检查网络或稍后重试'
    loadError.value = msg
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
  try {
    await ElMessageBox.confirm(
      `确认将状态从「${STATUS_LABELS[application.value.status]}」改为「${STATUS_LABELS[newStatus.value]}」？`,
      '状态变更确认',
      {
        type: 'warning',
        confirmButtonText: '确认变更',
        cancelButtonText: '取消'
      }
    )
  } catch {
    newStatus.value = application.value.status
    return
  }

  statusLoading.value = true
  try {
    const res = await applicationApi.updateStatus(application.value.id, newStatus.value)
    if (res.data.code === 200) {
      // 服务端返回完整 application（含 timeline），整体替换以保证时间线与状态联动刷新
      const updated = res.data.data
      application.value = { ...application.value, ...updated }
      newStatus.value = updated.status
      ElMessage.success('状态更新成功')
      refreshUnreadCount()
      // 终态（offered/rejected）会触发"安排面试"按钮禁用，并可能影响面试状态展示，统一刷新一次
      await fetchInterviews()
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
  const content = newMessage.value.trim()
  if (!content) {
    ElMessage.warning('请输入消息内容')
    return
  }
  if (!application.value) return
  messageLoading.value = true
  try {
    const res = await messageApi.create({
      applicationId: application.value.id,
      senderType: 'recruiter',
      content
    })
    if (res.data.code === 200) {
      messageList.value.push(res.data.data)
      newMessage.value = ''
      ElMessage.success('消息发送成功')
      refreshUnreadCount()
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

const editNotes = () => {
  if (notesEditing.value) {
    cancelNotes()
    return
  }
  notesDraft.value = application.value?.notes || ''
  notesEditing.value = true
}

const cancelNotes = () => {
  notesEditing.value = false
  notesDraft.value = application.value?.notes || ''
}

const saveNotes = async () => {
  if (!application.value) return
  notesSaving.value = true
  try {
    const res = await applicationApi.updateNotes(application.value.id, notesDraft.value)
    if (res.data.code === 200) {
      application.value.notes = notesDraft.value
      notesEditing.value = false
      ElMessage.success('备注保存成功')
    } else {
      ElMessage.error(res.data.message || '保存失败')
    }
  } catch (error) {
    console.error('保存备注失败:', error)
    const msg = error.response?.data?.message || '保存备注失败'
    ElMessage.error(msg)
  } finally {
    notesSaving.value = false
  }
}

const editOwner = async () => {
  if (!application.value) return
  try {
    const { value } = await ElMessageBox.prompt('请输入新负责人姓名', '更换负责人', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      inputValue: application.value.owner || '',
      inputPlaceholder: '请输入负责人姓名',
      inputValidator: (val) => {
        if (!val || !val.trim()) return '负责人姓名不能为空'
        return true
      }
    })
    const res = await applicationApi.updateOwner(application.value.id, value.trim())
    if (res.data.code === 200) {
      application.value.owner = value.trim()
      ElMessage.success('负责人更新成功')
      refreshUnreadCount()
    } else {
      ElMessage.error(res.data.message || '更新失败')
    }
  } catch (e) {
    if (e !== 'cancel') {
      console.error('更换负责人失败:', e)
    }
  }
}

const fetchInterviews = async () => {
  if (!application.value) return
  try {
    const res = await interviewApi.listByApplication(application.value.id)
    if (res.data.code === 200) {
      interviewList.value = res.data.data
    }
  } catch (error) {
    console.error('获取面试安排失败:', error)
  }
}

const openArrangeDialog = () => {
  if (isTerminalStatus.value) {
    ElMessage.warning('该候选人已淘汰或已发 Offer，不可再安排面试')
    return
  }
  arrangeForm.value = {
    round: (interviewList.value.length || 0) + 1,
    interviewer: '',
    scheduledTime: '',
    location: '视频会议'
  }
  arrangeDialogVisible.value = true
}

const arrangeInterview = async () => {
  if (!arrangeForm.value.interviewer.trim()) {
    ElMessage.warning('请填写面试官')
    return
  }
  if (!arrangeForm.value.scheduledTime) {
    ElMessage.warning('请选择面试时间')
    return
  }
  arrangeLoading.value = true
  try {
    const res = await interviewApi.create({
      applicationId: application.value.id,
      round: arrangeForm.value.round,
      interviewer: arrangeForm.value.interviewer.trim(),
      scheduledTime: arrangeForm.value.scheduledTime,
      location: arrangeForm.value.location
    })
    if (res.data.code === 200) {
      ElMessage.success('面试安排成功')
      arrangeDialogVisible.value = false
      await fetchInterviews()
      refreshUnreadCount()
    } else {
      ElMessage.error(res.data.message || '面试安排失败')
    }
  } catch (error) {
    console.error('面试安排失败:', error)
    const msg = error.response?.data?.message || '面试安排失败'
    ElMessage.error(msg)
  } finally {
    arrangeLoading.value = false
  }
}

const getInterviewStatusText = (status) => {
  const map = { scheduled: '已安排', completed: '已完成', cancelled: '已取消' }
  return map[status] || status
}

const getInterviewStatusType = (status) => {
  const map = { scheduled: 'warning', completed: 'success', cancelled: 'info' }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = {
    pending: '待筛选',
    contacted: '已沟通',
    interviewing: '面试中',
    offered: '已发 Offer',
    rejected: '已淘汰'
  }
  return map[status] || status
}

const getStatusType = (status) => {
  const map = {
    pending: 'info',
    contacted: 'success',
    interviewing: 'warning',
    offered: 'success',
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

.detail-nav {
  margin-bottom: 16px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.header-sub {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.owner-text {
  font-size: 13px;
  color: #909399;
}

.detail-header h2 {
  font-size: 24px;
  color: #303133;
  margin: 4px 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section {
  margin-bottom: 24px;
}

.resume-summary {
  background-color: #ecf5ff;
  padding: 16px;
  border-radius: 8px;
  color: #409eff;
  line-height: 1.8;
  border-left: 4px solid #409eff;
}

.resume-summary p {
  margin: 0;
}

.notes-display {
  background-color: #fdf6ec;
  padding: 16px;
  border-radius: 8px;
  line-height: 1.8;
  min-height: 60px;
  border-left: 4px solid #e6a23c;
}

.notes-display p {
  margin: 0;
  color: #606266;
}

.notes-empty {
  color: #c0c4cc !important;
  font-style: italic;
}

.notes-edit {
  margin-top: 8px;
}

.notes-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.arrange-select {
  width: 100%;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 12px;
}

.empty-inline {
  text-align: center;
  padding: 24px 0;
  color: #909399;
  background-color: #f5f7fa;
  border-radius: 8px;
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

.message-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
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
