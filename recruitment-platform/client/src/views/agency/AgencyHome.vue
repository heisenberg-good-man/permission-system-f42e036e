<template>
  <div class="agency-home">
    <div class="page-header">
      <div class="header-left">
        <h2>中介服务平台</h2>
        <p class="header-desc">在线匹配保姆、月嫂、维修工、保洁等服务人员，实名认证更安心</p>
      </div>
      <div class="header-actions">
        <el-button @click="$router.push('/agency/orders')">服务订单</el-button>
        <el-button type="primary" @click="$router.push('/agency/register')">注册为服务人员</el-button>
      </div>
    </div>

    <el-card class="filter-card">
      <div class="filter-bar">
        <el-input
          v-model="keyword"
          placeholder="搜索姓名、职业、技能、描述"
          clearable
          class="search-input"
          @keyup.enter="fetchWorkers"
        >
          <template #append>
            <el-button @click="fetchWorkers">搜索</el-button>
          </template>
        </el-input>
        <el-select v-model="professionFilter" placeholder="职业类别" clearable class="filter-select">
          <el-option v-for="p in professions" :key="p" :label="p" :value="p" />
        </el-select>
        <el-select v-model="cityFilter" placeholder="城市" clearable class="filter-select">
          <el-option label="北京" value="北京" />
          <el-option label="上海" value="上海" />
          <el-option label="广州" value="广州" />
          <el-option label="深圳" value="深圳" />
        </el-select>
        <el-select v-model="authFilter" placeholder="认证状态" clearable class="filter-select">
          <el-option label="已认证" value="verified" />
          <el-option label="审核中" value="pending" />
          <el-option label="未认证" value="unverified" />
        </el-select>
        <el-button v-if="hasFilter" type="danger" plain @click="clearFilters">清空筛选</el-button>
      </div>
    </el-card>

    <el-card v-loading="loading">
      <template v-if="loadError">
        <el-empty :description="loadError">
          <el-button type="primary" @click="fetchWorkers">重新加载</el-button>
        </el-empty>
      </template>
      <template v-else-if="workerList.length === 0 && !loading">
        <el-empty description="暂无符合条件的服务人员">
          <el-button v-if="hasFilter" type="primary" @click="clearFilters">清空筛选</el-button>
          <el-button @click="$router.push('/agency/register')">注册为服务人员</el-button>
        </el-empty>
      </template>
      <template v-else>
        <div class="worker-grid">
          <div
            v-for="worker in workerList"
            :key="worker.id"
            class="worker-card"
            @click="goDetail(worker.id)"
          >
            <div class="worker-top">
              <div class="worker-avatar">{{ worker.name.charAt(0) }}</div>
              <div class="worker-info">
                <div class="worker-name-row">
                  <span class="worker-name">{{ worker.name }}</span>
                  <el-tag size="small" :type="getAuthTagType(worker.authStatus)">
                    {{ getAuthLabel(worker.authStatus) }}
                  </el-tag>
                </div>
                <div class="worker-profession">{{ worker.profession }} · {{ worker.city }}</div>
              </div>
            </div>
            <div class="worker-skills">
              <el-tag v-for="skill in splitSkills(worker.skills)" :key="skill" size="small" type="info" class="skill-tag">
                {{ skill }}
              </el-tag>
            </div>
            <p class="worker-desc">{{ worker.description }}</p>
            <div class="worker-bottom">
              <div class="worker-meta">
                <span class="meta-item">经验：{{ worker.experience || '—' }}</span>
                <span class="meta-item">评分：{{ worker.rating || '暂无' }}</span>
                <span class="meta-item">完成：{{ worker.orderCount }}单</span>
              </div>
              <div class="worker-salary">{{ worker.expectedSalary || '面议' }}</div>
            </div>
            <div class="worker-status">
              <el-tag :type="worker.status === 'available' ? 'success' : 'warning'" size="small">
                {{ worker.status === 'available' ? '可接单' : '服务中' }}
              </el-tag>
            </div>
          </div>
        </div>
        <div class="pagination-wrap">
          <el-pagination
            v-model:current-page="page"
            :page-size="size"
            :total="total"
            layout="prev, pager, next, total"
            @current-change="fetchWorkers"
          />
        </div>
      </template>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { agencyApi } from '../../api'

const router = useRouter()

const professions = ['保姆', '月嫂', '育儿嫂', '护工', '保洁', '维修工', '钟点工', '其他']

const keyword = ref('')
const professionFilter = ref('')
const cityFilter = ref('')
const authFilter = ref('')

const workerList = ref([])
const loading = ref(false)
const loadError = ref('')
const page = ref(1)
const size = ref(9)
const total = ref(0)

const hasFilter = computed(() =>
  keyword.value || professionFilter.value || cityFilter.value || authFilter.value
)

const fetchWorkers = async () => {
  loading.value = true
  loadError.value = ''
  try {
    const params = { page: page.value, size: size.value }
    if (keyword.value) params.keyword = keyword.value
    if (professionFilter.value) params.profession = professionFilter.value
    if (cityFilter.value) params.city = cityFilter.value
    if (authFilter.value) params.authStatus = authFilter.value
    const res = await agencyApi.listWorkers(params)
    if (res.data.code === 200) {
      workerList.value = res.data.data.list
      total.value = res.data.data.total
    } else {
      loadError.value = res.data.message || '获取服务人员列表失败'
    }
  } catch (e) {
    console.error('获取服务人员失败:', e)
    loadError.value = '网络异常，获取服务人员列表失败'
  } finally {
    loading.value = false
  }
}

const clearFilters = () => {
  keyword.value = ''
  professionFilter.value = ''
  cityFilter.value = ''
  authFilter.value = ''
  page.value = 1
  fetchWorkers()
}

const goDetail = (id) => {
  router.push(`/agency/worker/${id}`)
}

const splitSkills = (skills) => {
  if (!skills) return []
  return skills.split(/[,，、\s]+/).filter(s => s)
}

const getAuthLabel = (status) => {
  const map = { unverified: '未认证', pending: '审核中', verified: '已认证', rejected: '已驳回' }
  return map[status] || status
}

const getAuthTagType = (status) => {
  const map = { unverified: 'info', pending: 'warning', verified: 'success', rejected: 'danger' }
  return map[status] || 'info'
}

onMounted(() => {
  fetchWorkers()
})
</script>

<style scoped>
.agency-home {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #409eff 0%, #67c23a 100%);
  color: #fff;
  border-radius: 8px;
}

.header-left h2 {
  margin: 0 0 8px;
  font-size: 24px;
}

.header-desc {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.filter-card {
  margin-bottom: 16px;
}

.filter-bar {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.search-input {
  flex: 1;
  min-width: 240px;
}

.filter-select {
  width: 140px;
}

.worker-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.worker-card {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.worker-card:hover {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
  transform: translateY(-2px);
}

.worker-top {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.worker-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #409eff;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  flex-shrink: 0;
}

.worker-info {
  flex: 1;
  min-width: 0;
}

.worker-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.worker-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.worker-profession {
  font-size: 13px;
  color: #909399;
}

.worker-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.skill-tag {
  margin: 0;
}

.worker-desc {
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
  margin: 0 0 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.worker-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.worker-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: #909399;
}

.worker-salary {
  font-size: 14px;
  font-weight: 600;
  color: #f56c6c;
}

.worker-status {
  position: absolute;
  top: 12px;
  right: 12px;
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
