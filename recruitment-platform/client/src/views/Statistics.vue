<template>
  <div class="statistics">
    <div class="stats-header">
      <h2>统计概览</h2>
      <el-button @click="refreshData">刷新数据</el-button>
    </div>

    <div class="stats-grid">
      <el-card class="stat-card">
        <div class="stat-icon jobs-icon">📋</div>
        <div class="stat-info">
          <div class="stat-value">{{ statistics.totalJobs }}</div>
          <div class="stat-label">职位总数</div>
        </div>
      </el-card>

      <el-card class="stat-card">
        <div class="stat-icon apps-icon">📄</div>
        <div class="stat-info">
          <div class="stat-value">{{ statistics.totalApplications }}</div>
          <div class="stat-label">投递总数</div>
        </div>
      </el-card>

      <el-card class="stat-card">
        <div class="stat-icon pending-icon">⏳</div>
        <div class="stat-info">
          <div class="stat-value">{{ statistics.pendingCount }}</div>
          <div class="stat-label">待筛选</div>
        </div>
      </el-card>

      <el-card class="stat-card">
        <div class="stat-icon contacted-icon">💬</div>
        <div class="stat-info">
          <div class="stat-value">{{ statistics.contactedCount }}</div>
          <div class="stat-label">已沟通</div>
        </div>
      </el-card>

      <el-card class="stat-card">
        <div class="stat-icon interviewing-icon">🎯</div>
        <div class="stat-info">
          <div class="stat-value">{{ statistics.interviewingCount }}</div>
          <div class="stat-label">面试中</div>
        </div>
      </el-card>

      <el-card class="stat-card">
        <div class="stat-icon rejected-icon">❌</div>
        <div class="stat-info">
          <div class="stat-value">{{ statistics.rejectedCount }}</div>
          <div class="stat-label">已拒绝</div>
        </div>
      </el-card>
    </div>

    <el-card class="chart-card">
      <h3 class="section-title">状态分布</h3>
      <div class="status-chart">
        <div class="chart-bar">
          <div class="bar-label">待筛选</div>
          <div class="bar-track">
            <div
              class="bar-fill pending"
              :style="{ width: getPercentage(statistics.pendingCount) + '%' }"
            ></div>
          </div>
          <div class="bar-value">{{ statistics.pendingCount }}</div>
        </div>
        <div class="chart-bar">
          <div class="bar-label">已沟通</div>
          <div class="bar-track">
            <div
              class="bar-fill contacted"
              :style="{ width: getPercentage(statistics.contactedCount) + '%' }"
            ></div>
          </div>
          <div class="bar-value">{{ statistics.contactedCount }}</div>
        </div>
        <div class="chart-bar">
          <div class="bar-label">面试中</div>
          <div class="bar-track">
            <div
              class="bar-fill interviewing"
              :style="{ width: getPercentage(statistics.interviewingCount) + '%' }"
            ></div>
          </div>
          <div class="bar-value">{{ statistics.interviewingCount }}</div>
        </div>
        <div class="chart-bar">
          <div class="bar-label">已拒绝</div>
          <div class="bar-track">
            <div
              class="bar-fill rejected"
              :style="{ width: getPercentage(statistics.rejectedCount) + '%' }"
            ></div>
          </div>
          <div class="bar-value">{{ statistics.rejectedCount }}</div>
        </div>
      </div>
    </el-card>

    <el-card class="recent-jobs-card">
      <h3 class="section-title">最近职位投递统计</h3>
      <el-table :data="recentJobs" style="width: 100%">
        <el-table-column prop="jobTitle" label="职位名称" />
        <el-table-column prop="totalApplications" label="投递总数" />
        <el-table-column prop="pendingCount" label="待筛选" />
        <el-table-column prop="contactedCount" label="已沟通" />
        <el-table-column prop="interviewingCount" label="面试中" />
        <el-table-column prop="rejectedCount" label="已拒绝" />
        <el-table-column label="操作">
          <template #default="scope">
            <el-button size="small" @click="$router.push(`/applications/${scope.row.jobId}`)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { statisticsApi, jobApi } from '../api'

const statistics = ref({
  totalJobs: 0,
  totalApplications: 0,
  pendingCount: 0,
  contactedCount: 0,
  interviewingCount: 0,
  rejectedCount: 0
})

const recentJobs = ref([])

const fetchStatistics = async () => {
  try {
    const res = await statisticsApi.overview()
    if (res.data.code === 200) {
      statistics.value = res.data.data
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

const fetchRecentJobs = async () => {
  try {
    const res = await jobApi.list({ page: 1, size: 10 })
    if (res.data.code === 200) {
      const jobs = res.data.data.list
      const jobStats = await Promise.all(
        jobs.map(async job => {
          const statRes = await statisticsApi.job(job.id)
          return statRes.data.code === 200 ? statRes.data.data : null
        })
      )
      recentJobs.value = jobStats.filter(Boolean)
    }
  } catch (error) {
    console.error('获取职位统计失败:', error)
  }
}

const getPercentage = (count) => {
  const total = statistics.value.totalApplications
  if (total === 0) return 0
  return Math.round((count / total) * 100)
}

const refreshData = async () => {
  await fetchStatistics()
  await fetchRecentJobs()
}

onMounted(() => {
  refreshData()
})
</script>

<style scoped>
.statistics {
  padding: 20px;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.stats-header h2 {
  font-size: 24px;
  color: #303133;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  font-size: 36px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: #ecf5ff;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.chart-card {
  margin-bottom: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 16px;
}

.status-chart {
  padding: 16px;
}

.chart-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.bar-label {
  width: 80px;
  font-size: 14px;
  color: #606266;
}

.bar-track {
  flex: 1;
  height: 24px;
  background-color: #f5f7fa;
  border-radius: 12px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 12px;
  transition: width 0.3s;
}

.bar-fill.pending {
  background-color: #409eff;
}

.bar-fill.contacted {
  background-color: #67c23a;
}

.bar-fill.interviewing {
  background-color: #e6a23c;
}

.bar-fill.rejected {
  background-color: #f56c6c;
}

.bar-value {
  width: 50px;
  text-align: right;
  font-size: 14px;
  font-weight: bold;
  color: #303133;
}

.recent-jobs-card {
  margin-bottom: 24px;
}
</style>
