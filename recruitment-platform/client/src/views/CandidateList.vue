<template>
  <div class="candidate-list">
    <div class="search-bar">
      <el-input
        v-model="keyword"
        placeholder="搜索姓名、电话、邮箱、技能"
        clearable
        class="search-input"
        @keyup.enter="fetchCandidates"
      >
        <template #append>
          <el-button @click="fetchCandidates">搜索</el-button>
        </template>
      </el-input>
      <el-select v-model="statusFilter" placeholder="筛选阶段" clearable class="filter-select">
        <el-option label="全部阶段" value="" />
        <el-option label="待筛选" value="pending" />
        <el-option label="已沟通" value="contacted" />
        <el-option label="面试中" value="interviewing" />
        <el-option label="已发 Offer" value="offered" />
        <el-option label="已淘汰" value="rejected" />
      </el-select>
      <el-select v-model="jobIdFilter" placeholder="筛选职位" clearable class="filter-select">
        <el-option label="全部职位" value="" />
        <el-option v-for="job in jobOptions" :key="job.id" :label="job.title" :value="job.id" />
      </el-select>
      <el-select v-model="sourceFilter" placeholder="筛选来源" clearable class="filter-select">
        <el-option label="全部来源" value="" />
        <el-option label="官网投递" value="官网投递" />
        <el-option label="内推" value="内推" />
        <el-option label="猎头推荐" value="猎头推荐" />
        <el-option label="招聘网站" value="招聘网站" />
        <el-option label="其他" value="其他" />
      </el-select>
      <el-button v-if="hasFilter" type="danger" plain @click="clearFilters">
        清空筛选
      </el-button>
    </div>

    <el-card v-loading="loading">
      <template v-if="loadError" #empty>
        <div class="empty-state">
          <el-icon size="48" color="#f56c6c">
            <Warning />
          </el-icon>
          <p>加载失败：{{ loadError }}</p>
          <div class="empty-actions">
            <el-button type="primary" @click="fetchCandidates">重新加载</el-button>
            <el-button @click="clearFilters">清空筛选</el-button>
          </div>
        </div>
      </template>
      <template v-else-if="candidateList.length === 0 && !loading" #empty>
        <div class="empty-state">
          <el-icon size="48">
            <User />
          </el-icon>
          <p>{{ hasFilter ? '没有匹配的候选人，试试换个条件？' : '暂无候选人数据' }}</p>
          <div v-if="hasFilter" class="empty-actions">
            <el-button type="primary" @click="clearFilters">一键清空筛选</el-button>
          </div>
        </div>
      </template>
      <el-table :data="candidateList" style="width: 100%">
        <el-table-column prop="candidateName" label="姓名" width="100" />
        <el-table-column prop="jobTitle" label="投递职位" width="160" />
        <el-table-column prop="phone" label="电话" width="130" />
        <el-table-column prop="source" label="来源" width="100">
          <template #default="scope">
            <el-tag size="small" type="info">{{ scope.row.source || '—' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="owner" label="负责人" width="100" />
        <el-table-column prop="education" label="学历" width="80" />
        <el-table-column prop="experience" label="工作经验" width="100" />
        <el-table-column prop="skills" label="技能" min-width="150" show-overflow-tooltip />
        <el-table-column prop="status" label="阶段" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)" size="small">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="投递时间" width="160">
          <template #default="scope">
            {{ formatTime(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button size="small" type="primary" link @click="$router.push(`/application/${scope.row.id}`)">查看详情</el-button>
            <el-select size="small" v-model="scope.row.newStatus" @change="updateStatus(scope.row)" :disabled="scope.row.statusLoading" style="width: 100px">
              <el-option label="待筛选" value="pending" />
              <el-option label="已沟通" value="contacted" />
              <el-option label="面试中" value="interviewing" />
              <el-option label="已发 Offer" value="offered" />
              <el-option label="已淘汰" value="rejected" />
            </el-select>
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
          @size-change="fetchCandidates"
          @current-change="fetchCandidates"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Warning } from '@element-plus/icons-vue'
import { applicationApi, jobApi } from '../api'

const refreshUnreadCount = inject('refreshUnreadCount', () => {})

const keyword = ref('')
const statusFilter = ref('')
const jobIdFilter = ref('')
const sourceFilter = ref('')
const page = ref(1)
const size = ref(10)
const loading = ref(false)
const loadError = ref('')
const candidateList = ref([])
const total = ref(0)
const jobOptions = ref([])

const hasFilter = computed(() => !!keyword.value || !!statusFilter.value || !!jobIdFilter.value || !!sourceFilter.value)

const clearFilters = () => {
  keyword.value = ''
  statusFilter.value = ''
  jobIdFilter.value = ''
  sourceFilter.value = ''
  page.value = 1
  fetchCandidates()
}

const STATUS_LABELS = {
  pending: '待筛选',
  contacted: '已沟通',
  interviewing: '面试中',
  offered: '已发 Offer',
  rejected: '已淘汰'
}

const fetchCandidates = async () => {
  loading.value = true
  loadError.value = ''
  try {
    const params = {
      keyword: keyword.value,
      status: statusFilter.value,
      jobId: jobIdFilter.value,
      source: sourceFilter.value,
      page: page.value,
      size: size.value
    }
    const res = await applicationApi.all(params)
    if (res.data.code === 200) {
      candidateList.value = res.data.data.list.map(item => ({
        ...item,
        newStatus: item.status,
        statusLoading: false
      }))
      total.value = res.data.data.total
    } else {
      loadError.value = res.data.message || '获取候选人列表失败'
    }
  } catch (error) {
    console.error('获取候选人列表失败:', error)
    loadError.value = '网络异常，获取候选人列表失败'
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

const updateStatus = async (candidate) => {
  const targetStatus = candidate.newStatus
  if (targetStatus === candidate.status) return
  try {
    await ElMessageBox.confirm(
      `确认将「${candidate.candidateName}」的状态从「${STATUS_LABELS[candidate.status]}」改为「${STATUS_LABELS[targetStatus]}」？`,
      '状态变更确认',
      {
        type: 'warning',
        confirmButtonText: '确认变更',
        cancelButtonText: '取消'
      }
    )
  } catch {
    candidate.newStatus = candidate.status
    return
  }

  candidate.statusLoading = true
  try {
    const res = await applicationApi.updateStatus(candidate.id, targetStatus)
    if (res.data.code === 200) {
      candidate.status = targetStatus
      candidate.newStatus = targetStatus
      ElMessage.success('状态更新成功')
      refreshUnreadCount()
      await fetchCandidates()
    } else {
      ElMessage.error(res.data.message || '状态更新失败')
      candidate.newStatus = candidate.status
    }
  } catch (error) {
    console.error('状态更新失败:', error)
    const msg = error.response?.data?.message || '状态更新失败'
    ElMessage.error(msg)
    candidate.newStatus = candidate.status
  } finally {
    candidate.statusLoading = false
  }
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
  fetchJobs()
  fetchCandidates()
})
</script>

<style scoped>
.candidate-list {
  padding: 20px;
}

.search-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.search-input {
  width: 300px;
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

.empty-actions {
  margin-top: 16px;
  display: flex;
  gap: 12px;
  justify-content: center;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
