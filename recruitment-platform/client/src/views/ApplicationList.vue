<template>
  <div class="application-list">
    <div class="search-bar">
      <el-input
        v-model="keyword"
        placeholder="搜索姓名、电话、邮箱、技能"
        clearable
        class="search-input"
        @keyup.enter="fetchApplications"
      >
        <template #append>
          <el-button @click="fetchApplications">搜索</el-button>
        </template>
      </el-input>
      <el-select v-model="statusFilter" placeholder="筛选状态" clearable class="filter-select" @change="fetchApplications">
        <el-option label="全部" value="" />
        <el-option label="待筛选" value="pending" />
        <el-option label="已沟通" value="contacted" />
        <el-option label="面试中" value="interviewing" />
        <el-option label="已发 Offer" value="offered" />
        <el-option label="已淘汰" value="rejected" />
      </el-select>
    </div>

    <el-card v-loading="loading">
      <template v-if="loadError" #empty>
        <div class="empty-state">
          <el-icon size="48" color="#f56c6c">
            <Warning />
          </el-icon>
          <p>加载失败：{{ loadError }}</p>
          <div class="empty-actions">
            <el-button type="primary" @click="fetchApplications">重新加载</el-button>
            <el-button @click="clearFilters">清空筛选</el-button>
          </div>
        </div>
      </template>
      <template v-else-if="applicationList.length === 0 && !loading" #empty>
        <div class="empty-state">
          <el-icon size="48">
            <User />
          </el-icon>
          <p>{{ hasFilter ? '没有匹配的投递记录，试试换个条件？' : '暂无投递数据' }}</p>
          <div v-if="hasFilter" class="empty-actions">
            <el-button type="primary" @click="clearFilters">一键清空筛选</el-button>
          </div>
        </div>
      </template>
      <el-table :data="applicationList" style="width: 100%">
        <el-table-column prop="candidateName" label="姓名" />
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
          @size-change="fetchApplications"
          @current-change="fetchApplications"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Warning } from '@element-plus/icons-vue'
import { applicationApi } from '../api'

const route = useRoute()
const refreshUnreadCount = inject('refreshUnreadCount', () => {})
const keyword = ref('')
const statusFilter = ref('')
const page = ref(1)
const size = ref(10)
const loading = ref(false)
const loadError = ref('')
const applicationList = ref([])
const total = ref(0)

const hasFilter = computed(() => !!keyword.value || !!statusFilter.value)

const clearFilters = () => {
  keyword.value = ''
  statusFilter.value = ''
  page.value = 1
  fetchApplications()
}

const STATUS_LABELS = {
  pending: '待筛选',
  contacted: '已沟通',
  interviewing: '面试中',
  offered: '已发 Offer',
  rejected: '已淘汰'
}

const fetchApplications = async () => {
  loading.value = true
  loadError.value = ''
  try {
    const params = {
      keyword: keyword.value,
      status: statusFilter.value,
      page: page.value,
      size: size.value
    }
    const res = await applicationApi.list(route.params.jobId, params)
    if (res.data.code === 200) {
      applicationList.value = res.data.data.list.map(item => ({
        ...item,
        newStatus: item.status,
        statusLoading: false
      }))
      total.value = res.data.data.total
    } else {
      loadError.value = res.data.message || '获取投递列表失败'
    }
  } catch (error) {
    console.error('获取投递列表失败:', error)
    loadError.value = '网络异常，获取投递列表失败'
  } finally {
    loading.value = false
  }
}

const updateStatus = async (application) => {
  const targetStatus = application.newStatus
  if (targetStatus === application.status || application.statusLoading) return
  try {
    await ElMessageBox.confirm(
      `确认将「${application.candidateName}」的状态从「${STATUS_LABELS[application.status]}」改为「${STATUS_LABELS[targetStatus]}」？`,
      '状态变更确认',
      {
        type: 'warning',
        confirmButtonText: '确认变更',
        cancelButtonText: '取消'
      }
    )
  } catch {
    application.newStatus = application.status
    return
  }

  application.statusLoading = true
  try {
    const res = await applicationApi.updateStatus(application.id, targetStatus)
    if (res.data.code === 200) {
      application.status = targetStatus
      application.newStatus = targetStatus
      ElMessage.success('状态更新成功')
      refreshUnreadCount()
      await fetchApplications()
    } else {
      ElMessage.error(res.data.message || '状态更新失败')
      application.newStatus = application.status
    }
  } catch (error) {
    console.error('状态更新失败:', error)
    const msg = error.response?.data?.message || '状态更新失败'
    ElMessage.error(msg)
    application.newStatus = application.status
  } finally {
    application.statusLoading = false
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

onMounted(fetchApplications)
</script>

<style scoped>
.application-list {
  padding: 20px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.list-header h2 {
  font-size: 24px;
  color: #303133;
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
