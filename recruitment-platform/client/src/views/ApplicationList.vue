<template>
  <div class="application-list">
    <div class="list-header">
      <h2>候选人投递列表</h2>
      <el-select v-model="statusFilter" placeholder="筛选状态" clearable @change="fetchApplications">
        <el-option label="全部" value="" />
        <el-option label="待筛选" value="pending" />
        <el-option label="已沟通" value="contacted" />
        <el-option label="面试中" value="interviewing" />
        <el-option label="已拒绝" value="rejected" />
      </el-select>
    </div>

    <el-card>
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
            <el-select size="small" v-model="scope.row.newStatus" @change="updateStatus(scope.row)">
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
          @size-change="fetchApplications"
          @current-change="fetchApplications"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { applicationApi } from '../api'

const route = useRoute()
const statusFilter = ref('')
const page = ref(1)
const size = ref(10)
const applicationList = ref([])
const total = ref(0)

const fetchApplications = async () => {
  try {
    const params = {
      status: statusFilter.value,
      page: page.value,
      size: size.value
    }
    const res = await applicationApi.list(route.params.jobId, params)
    if (res.data.code === 200) {
      applicationList.value = res.data.data.list.map(item => ({
        ...item,
        newStatus: item.status
      }))
      total.value = res.data.data.total
    }
  } catch (error) {
    console.error('获取投递列表失败:', error)
  }
}

const updateStatus = async (application) => {
  if (application.status === application.newStatus) return
  try {
    const res = await applicationApi.updateStatus(application.id, application.newStatus)
    if (res.data.code === 200) {
      application.status = application.newStatus
      ElMessage.success('状态更新成功')
    }
  } catch (error) {
    ElMessage.error('状态更新失败')
    application.newStatus = application.status
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

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
