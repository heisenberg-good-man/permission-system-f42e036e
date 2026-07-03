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
      <el-select v-model="statusFilter" placeholder="筛选状态" clearable class="filter-select">
        <el-option label="全部" value="" />
        <el-option label="待筛选" value="pending" />
        <el-option label="已沟通" value="contacted" />
        <el-option label="面试中" value="interviewing" />
        <el-option label="已拒绝" value="rejected" />
      </el-select>
      <el-select v-model="jobIdFilter" placeholder="筛选职位" clearable class="filter-select">
        <el-option label="全部" value="" />
        <el-option v-for="job in jobOptions" :key="job.id" :label="job.title" :value="job.id" />
      </el-select>
    </div>

    <el-card v-loading="loading">
      <template #empty>
        <div class="empty-state">
          <el-icon size="48">
            <User />
          </el-icon>
          <p>暂无候选人数据</p>
        </div>
      </template>
      <el-table :data="candidateList" style="width: 100%">
        <el-table-column prop="candidateName" label="姓名" />
        <el-table-column prop="jobTitle" label="投递职位" />
        <el-table-column prop="phone" label="电话" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="education" label="学历" />
        <el-table-column prop="experience" label="工作经验" />
        <el-table-column prop="skills" label="技能" width="200" />
        <el-table-column prop="expectSalary" label="期望薪资" />
        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="投递时间" width="180">
          <template #default="scope">
            {{ formatTime(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="$router.push(`/application/${scope.row.id}`)">查看详情</el-button>
            <el-select size="small" v-model="scope.row.newStatus" @change="updateStatus(scope.row)" :disabled="scope.row.statusLoading">
              <el-option label="待筛选" value="pending" />
              <el-option label="已沟通" value="contacted" />
              <el-option label="面试中" value="interviewing" />
              <el-option label="已拒绝" value="rejected" />
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
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { User } from '@element-plus/icons-vue'
import { applicationApi, jobApi } from '../api'

const keyword = ref('')
const statusFilter = ref('')
const jobIdFilter = ref('')
const page = ref(1)
const size = ref(10)
const loading = ref(false)
const candidateList = ref([])
const total = ref(0)
const jobOptions = ref([])

const fetchCandidates = async () => {
  loading.value = true
  try {
    const params = {
      keyword: keyword.value,
      status: statusFilter.value,
      jobId: jobIdFilter.value,
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
    }
  } catch (error) {
    console.error('获取候选人列表失败:', error)
    ElMessage.error('获取候选人列表失败')
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
  if (candidate.status === candidate.newStatus || candidate.statusLoading) return
  candidate.statusLoading = true
  try {
    const res = await applicationApi.updateStatus(candidate.id, candidate.newStatus)
    if (res.data.code === 200) {
      await fetchCandidates()
      ElMessage.success('状态更新成功')
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

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
