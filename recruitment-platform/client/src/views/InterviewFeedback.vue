<template>
  <div class="interview-feedback">
    <div class="back-bar">
      <el-button @click="$router.push('/interviews')">返回面试反馈列表</el-button>
    </div>

    <el-card v-loading="loading">
      <template v-if="interview">
      <!-- 面试元信息 -->
      <div class="detail-header">
        <div>
          <h2>{{ interview.jobTitle }} · {{ interview.roundName }}</h2>
          <div class="meta-line">
            <el-tag :type="getInterviewStatusType(interview.status)">
              {{ getInterviewStatusText(interview.status) }}
            </el-tag>
            <el-tag :type="interview.feedbackStatus === 'submitted' ? 'success' : 'info'">
              {{ interview.feedbackStatus === 'submitted' ? '已反馈' : '待反馈' }}
            </el-tag>
            <el-tag v-if="application" :type="getCandidateStatusType(application.status)">
              候选人：{{ getCandidateStatusText(application.status) }}
            </el-tag>
          </div>
        </div>
      </div>

      <div class="section">
        <h3 class="section-title">面试信息</h3>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="候选人">{{ interview.candidateName }}</el-descriptions-item>
          <el-descriptions-item label="面试官">{{ interview.interviewer }}</el-descriptions-item>
          <el-descriptions-item label="面试轮次">{{ interview.roundName }}（第 {{ interview.round }} 轮）</el-descriptions-item>
          <el-descriptions-item label="面试时间">{{ formatTime(interview.scheduledTime) }}</el-descriptions-item>
          <el-descriptions-item label="面试地点" :span="2">{{ interview.location }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 候选人简历摘要 -->
      <div class="section" v-if="application">
        <h3 class="section-title">候选人简历摘要</h3>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="姓名">{{ application.candidateName }}</el-descriptions-item>
          <el-descriptions-item label="学历">{{ application.education }}</el-descriptions-item>
          <el-descriptions-item label="工作经验">{{ application.experience }}</el-descriptions-item>
          <el-descriptions-item label="期望薪资">{{ application.expectSalary }}</el-descriptions-item>
          <el-descriptions-item label="技能" :span="2">{{ application.skills }}</el-descriptions-item>
          <el-descriptions-item label="简历内容" :span="2">
            <div class="resume-content">{{ application.resume }}</div>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 历史沟通 -->
      <div class="section">
        <h3 class="section-title">历史沟通（候选人侧可见进展说明）</h3>
        <div class="message-list" v-if="messageList.length">
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
        <el-empty v-else description="暂无沟通记录" :image-size="60" />
      </div>

      <!-- 已有评价 -->
      <div class="section" v-if="interview.feedback">
        <h3 class="section-title">已有评价（保存于 {{ formatTime(interview.feedback.updatedAt) }}）</h3>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="评分">
            <el-rate :model-value="interview.feedback.rating" disabled />
          </el-descriptions-item>
          <el-descriptions-item label="优势">{{ interview.feedback.strengths || '—' }}</el-descriptions-item>
          <el-descriptions-item label="风险点">{{ interview.feedback.risks || '—' }}</el-descriptions-item>
          <el-descriptions-item label="结论建议">
            <el-tag :type="getConclusionType(interview.feedback.conclusion)">
              {{ getConclusionText(interview.feedback.conclusion) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="备注">{{ interview.feedback.comment || '—' }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 反馈表单 -->
      <div class="section">
        <h3 class="section-title">
          {{ interview.feedback ? '修改反馈' : '填写面试反馈' }}
        </h3>

        <el-alert
          v-if="readOnly"
          :title="readOnlyTip"
          type="warning"
          show-icon
          :closable="false"
          class="readonly-alert"
        />

        <el-form :model="form" label-width="100px" :disabled="readOnly || saving" class="feedback-form">
          <el-form-item label="评分" required>
            <el-rate v-model="form.rating" :max="5" show-text :texts="['很差','较差','一般','良好','优秀']" />
          </el-form-item>
          <el-form-item label="优势">
            <el-input v-model="form.strengths" type="textarea" :rows="3" placeholder="候选人表现出的优势/亮点" />
          </el-form-item>
          <el-form-item label="风险点">
            <el-input v-model="form.risks" type="textarea" :rows="3" placeholder="候选人存在的风险或不足" />
          </el-form-item>
          <el-form-item label="结论建议" required>
            <el-select v-model="form.conclusion" placeholder="请选择结论建议" class="conclusion-select">
              <el-option label="进入下一轮" value="next_round" />
              <el-option label="待定" value="pending" />
              <el-option label="发 Offer" value="offer" />
              <el-option label="淘汰" value="reject" />
            </el-select>
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="form.comment" type="textarea" :rows="2" placeholder="其他说明" />
          </el-form-item>
          <el-form-item label="面试官">
            <el-input v-model="form.interviewer" placeholder="默认取面试记录的面试官" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="saving" @click="saveFeedback">
              {{ interview.feedback ? '保存修改' : '提交反馈' }}
            </el-button>
            <el-button v-if="interview.feedback" @click="handleCancelEdit">取消修改</el-button>
            <span v-if="interview.feedback" class="form-tip">已存在反馈，提交将更新原有评价（不会产生重复记录）</span>
          </el-form-item>
        </el-form>
      </div>
      </template>
      <template v-else-if="!loading">
        <el-empty description="面试记录不存在或已删除">
          <el-button type="primary" @click="$router.push('/interviews')">返回列表</el-button>
        </el-empty>
      </template>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { interviewApi } from '../api'

const route = useRoute()
const refreshUnreadCount = inject('refreshUnreadCount', () => {})
const interview = ref(null)
const application = ref(null)
const messageList = ref([])
const loading = ref(false)
const saving = ref(false)
const originalForm = ref({})

const form = ref({
  rating: 0,
  strengths: '',
  risks: '',
  conclusion: '',
  comment: '',
  interviewer: ''
})

const readOnly = computed(() => {
  if (!application.value) return false
  const isTerminal = application.value.status === 'rejected' || application.value.status === 'offered'
  return isTerminal
})

const readOnlyTip = computed(() => {
  if (!application.value) return ''
  const label = application.value.status === 'offered' ? '已发 Offer' : '已淘汰'
  return `该候选人${label}，不可再提交普通面试反馈（表单仅作查看）`
})

const hasFeedbackChanged = () => {
  const f = form.value
  const o = originalForm.value
  return f.rating !== o.rating || f.strengths !== o.strengths ||
    f.risks !== o.risks || f.conclusion !== o.conclusion ||
    f.comment !== o.comment || f.interviewer !== o.interviewer
}

const fetchDetail = async () => {
  loading.value = true
  try {
    const res = await interviewApi.get(route.params.id)
    if (res.data.code === 200) {
      interview.value = res.data.data
      application.value = res.data.data.application
      messageList.value = res.data.data.messages || []
      const fb = res.data.data.feedback
      if (fb) {
        form.value = {
          rating: fb.rating,
          strengths: fb.strengths || '',
          risks: fb.risks || '',
          conclusion: fb.conclusion,
          comment: fb.comment || '',
          interviewer: fb.interviewer || ''
        }
      } else {
        form.value = {
          rating: 0,
          strengths: '',
          risks: '',
          conclusion: '',
          comment: '',
          interviewer: interview.value.interviewer
        }
      }
      originalForm.value = { ...form.value }
    } else {
      ElMessage.error(res.data.message || '获取面试详情失败')
    }
  } catch (error) {
    console.error('获取面试详情失败:', error)
    const msg = error.response?.data?.message || '获取面试详情失败'
    ElMessage.error(msg)
  } finally {
    loading.value = false
  }
}

const handleCancelEdit = async () => {
  if (hasFeedbackChanged()) {
    try {
      await ElMessageBox.confirm('您有未保存的修改，确认放弃吗？', '提示', {
        type: 'warning',
        confirmButtonText: '确认放弃',
        cancelButtonText: '继续编辑'
      })
    } catch {
      return
    }
  }
  form.value = { ...originalForm.value }
}

const saveFeedback = async () => {
  if (saving.value) return
  if (readOnly.value) {
    ElMessage.warning(readOnlyTip.value)
    return
  }
  if (!form.value.rating) {
    ElMessage.warning('请填写评分')
    return
  }
  if (!form.value.conclusion) {
    ElMessage.warning('请选择结论建议')
    return
  }

  saving.value = true
  try {
    const res = await interviewApi.saveFeedback(route.params.id, {
      rating: form.value.rating,
      strengths: form.value.strengths,
      risks: form.value.risks,
      conclusion: form.value.conclusion,
      comment: form.value.comment,
      interviewer: form.value.interviewer
    })
    if (res.data.code === 200) {
      ElMessage.success('反馈保存成功')
      await fetchDetail()
      refreshUnreadCount()
    } else {
      ElMessage.error(res.data.message || '反馈保存失败')
    }
  } catch (error) {
    console.error('反馈保存失败:', error)
    const msg = error.response?.data?.message || '反馈保存失败'
    ElMessage.error(msg)
  } finally {
    saving.value = false
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

const getCandidateStatusText = (status) => {
  const map = {
    pending: '待筛选',
    contacted: '已沟通',
    interviewing: '面试中',
    offered: '已发 Offer',
    rejected: '已淘汰'
  }
  return map[status] || status
}

const getCandidateStatusType = (status) => {
  const map = {
    pending: 'info',
    contacted: 'success',
    interviewing: 'warning',
    offered: 'success',
    rejected: 'danger'
  }
  return map[status] || 'info'
}

const getConclusionText = (c) => {
  const map = { next_round: '进入下一轮', pending: '待定', offer: '发 Offer', reject: '淘汰' }
  return map[c] || c
}

const getConclusionType = (c) => {
  const map = { next_round: 'primary', pending: 'warning', offer: 'success', reject: 'danger' }
  return map[c] || 'info'
}

const formatTime = (time) => {
  if (!time) return ''
  return new Date(time).toLocaleString('zh-CN')
}

onMounted(fetchDetail)
</script>

<style scoped>
.interview-feedback {
  padding: 20px;
}

.back-bar {
  margin-bottom: 16px;
}

.detail-header {
  margin-bottom: 24px;
}

.detail-header h2 {
  font-size: 22px;
  color: #303133;
  margin-bottom: 8px;
}

.meta-line {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
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
  white-space: pre-wrap;
  line-height: 1.8;
  color: #606266;
}

.message-list {
  background-color: #f5f7fa;
  padding: 16px;
  border-radius: 8px;
  max-height: 320px;
  overflow-y: auto;
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

.readonly-alert {
  margin-bottom: 16px;
}

.feedback-form {
  max-width: 640px;
}

.conclusion-select {
  width: 240px;
}

.form-tip {
  margin-left: 12px;
  font-size: 12px;
  color: #909399;
}
</style>
