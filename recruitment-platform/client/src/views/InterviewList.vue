<template>
  <div class="interview-list">
    <div class="list-header">
      <h2>面试反馈</h2>
      <span class="header-tip">从已安排/已完成的面试进入反馈页，按条件筛选并填写面试评价</span>
    </div>

    <div class="search-bar">
      <el-select v-model="jobIdFilter" placeholder="筛选职位" clearable class="filter-select" @change="fetchInterviews">
        <el-option v-for="job in jobOptions" :key="job.id" :label="job.title" :value="job.id" />
      </el-select>
      <el-input
        v-model="candidateName"
        placeholder="搜索候选人/面试官"
        clearable
        class="search-input"
        @keyup.enter="fetchInterviews"
      >
        <template #append>
          <el-button @click="fetchInterviews">搜索</el-button>
        </template>
      </el-input>
      <el-select v-model="roundFilter" placeholder="面试轮次" clearable class="filter-select" @change="fetchInterviews">
        <el-option label="初试" :value="1" />
        <el-option label="复试" :value="2" />
        <el-option label="终试" :value="3" />
      </el-select>
      <el-select v-model="feedbackStatusFilter" placeholder="反馈状态" clearable class="filter-select" @change="fetchInterviews">
        <el-option label="待反馈" value="pending" />
        <el-option label="已反馈" value="submitted" />
      </el-select>
      <el-select v-model="statusFilter" placeholder="面试状态" clearable class="filter-select" @change="fetchInterviews">
        <el-option label="已安排" value="scheduled" />
        <el-option label="已完成" value="completed" />
        <el-option label="已取消" value="cancelled" />
      </el-select>
    </div>

    <el-card v-loading="loading">
      <template #empty>
        <div class="empty-state">
          <el-icon size="48">
            <Calendar />
          </el-icon>
          <p>暂无面试记录</p>
          <p class="empty-sub">可在投递详情页"安排面试"后，再回到此处填写反馈</p>
        </div>
      </template>
      <el-table :data="interviewList" style="width: 100%">
        <el-table-column prop="candidateName" label="候选人" width="100" />
        <el-table-column prop="jobTitle" label="职位" />
        <el-table-column label="轮次" width="80">
          <template #default="scope">
            {{ scope.row.roundName }}
          </template>
        </el-table-column>
        <el-table-column prop="interviewer" label="面试官" width="120" />
        <el-table-column label="面试时间" width="180">
          <template #default="scope">
            {{ formatTime(scope.row.scheduledTime) }}
          </template>
        </el-table-column>
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
            <el-button size="small" type="primary" @click="$router.push(`/interview/${scope.row.id}`)">
              {{ scope.row.feedbackStatus === 'submitted' ? '查看反馈' : '填写反馈' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="size"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchInterviews"
          @current-change="fetchInterviews"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Calendar } from '@element-plus/icons-vue'
import { interviewApi, jobApi } from '../api'

const jobIdFilter = ref('')
const candidateName = ref('')
const roundFilter = ref('')
const feedbackStatusFilter = ref('')
const statusFilter = ref('')
const page = ref(1)
const size = ref(10)
const loading = ref(false)
const interviewList = ref([])
const total = ref(0)
const jobOptions = ref([])

const fetchInterviews = async () => {
  loading.value = true
  try {
    const params = {
      jobId: jobIdFilter.value,
      candidateName: candidateName.value,
      round: roundFilter.value,
      feedbackStatus: feedbackStatusFilter.value,
      status: statusFilter.value,
      page: page.value,
      size: size.value
    }
    const res = await interviewApi.list(params)
    if (res.data.code === 200) {
      interviewList.value = res.data.data.list
      total.value = res.data.data.total
    } else {
      ElMessage.error(res.data.message || '获取面试列表失败')
    }
  } catch (error) {
    console.error('获取面试列表失败:', error)
    ElMessage.error('获取面试列表失败')
  } finally {
    loading.value = false
  }
}

const fetchJobs = async () => {
  try {
    const res = await jobApi.list({ size: 100 })
    if (res.data.code === 200) {
      jobOptions.value = res.data.data.list
    }
  } catch (error) {
    console.error('获取职位列表失败:', error)
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

const formatTime = (time) => {
  if (!time) return ''
  return new Date(time).toLocaleString('zh-CN')
}

onMounted(() => {
  fetchJobs()
  fetchInterviews()
})
</script>

<style scoped>
.interview-list {
  padding: 20px;
}

.list-header {
  display: flex;
  align-items: baseline;
  gap: 16px;
  margin-bottom: 20px;
}

.list-header h2 {
  font-size: 24px;
  color: #303133;
}

.header-tip {
  font-size: 13px;
  color: #909399;
}

.search-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.search-input {
  width: 240px;
}

.filter-select {
  width: 150px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0;
  color: #909399;
}

.empty-state p {
  margin-top: 12px;
}

.empty-state .empty-sub {
  font-size: 12px;
  color: #c0c4cc;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
