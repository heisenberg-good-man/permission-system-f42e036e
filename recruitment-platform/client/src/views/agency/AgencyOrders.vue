<template>
  <div class="agency-orders">
    <div class="detail-nav">
      <el-button link @click="$router.push('/agency')">← 返回中介服务</el-button>
    </div>

    <el-card class="filter-card">
      <div class="filter-bar">
        <el-input
          v-model="keyword"
          placeholder="搜索客户、服务人员、需求描述"
          clearable
          class="search-input"
          @keyup.enter="fetchOrders"
        >
          <template #append>
            <el-button @click="fetchOrders">搜索</el-button>
          </template>
        </el-input>
        <el-select v-model="statusFilter" placeholder="订单状态" clearable class="filter-select">
          <el-option label="待确认" value="pending" />
          <el-option label="已确认" value="confirmed" />
          <el-option label="进行中" value="in_progress" />
          <el-option label="已完成" value="completed" />
          <el-option label="已取消" value="cancelled" />
        </el-select>
        <el-select v-model="professionFilter" placeholder="职业类别" clearable class="filter-select">
          <el-option v-for="p in professions" :key="p" :label="p" :value="p" />
        </el-select>
        <el-button v-if="hasFilter" type="danger" plain @click="clearFilters">清空筛选</el-button>
      </div>
    </el-card>

    <el-card v-loading="loading">
      <template v-if="loadError">
        <el-empty :description="loadError">
          <el-button type="primary" @click="fetchOrders">重新加载</el-button>
        </el-empty>
      </template>
      <template v-else-if="orderList.length === 0 && !loading">
        <el-empty description="暂无订单">
          <el-button type="primary" @click="$router.push('/agency')">去匹配服务人员</el-button>
        </el-empty>
      </template>
      <template v-else>
        <el-table :data="orderList" style="width: 100%">
          <el-table-column label="订单号" width="80">
            <template #default="{ row }">#{{ row.id }}</template>
          </el-table-column>
          <el-table-column prop="profession" label="职业" width="90">
            <template #default="{ row }">
              <el-tag size="small">{{ row.profession }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="workerName" label="服务人员" width="100" />
          <el-table-column prop="customerName" label="客户" width="90" />
          <el-table-column prop="description" label="需求描述" show-overflow-tooltip min-width="180" />
          <el-table-column prop="budget" label="预算" width="120" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small">
                {{ getStatusLabel(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="下单时间" width="160">
            <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
          </el-table-column>
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="goDetail(row.id)">查看详情</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination-wrap">
          <el-pagination
            v-model:current-page="page"
            :page-size="size"
            :total="total"
            layout="prev, pager, next, total"
            @current-change="fetchOrders"
          />
        </div>
      </template>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { agencyApi } from '../../api'

const router = useRouter()
const professions = ['保姆', '月嫂', '育儿嫂', '护工', '保洁', '维修工', '钟点工', '其他']

const keyword = ref('')
const statusFilter = ref('')
const professionFilter = ref('')

const orderList = ref([])
const loading = ref(false)
const loadError = ref('')
const page = ref(1)
const size = ref(10)
const total = ref(0)

const hasFilter = computed(() => keyword.value || statusFilter.value || professionFilter.value)

const fetchOrders = async () => {
  loading.value = true
  loadError.value = ''
  try {
    const params = { page: page.value, size: size.value }
    if (keyword.value) params.keyword = keyword.value
    if (statusFilter.value) params.status = statusFilter.value
    if (professionFilter.value) params.profession = professionFilter.value
    const res = await agencyApi.listOrders(params)
    if (res.data.code === 200) {
      orderList.value = res.data.data.list
      total.value = res.data.data.total
    } else {
      loadError.value = res.data.message || '获取订单列表失败'
    }
  } catch (e) {
    console.error('获取订单失败:', e)
    loadError.value = '网络异常，获取订单列表失败'
  } finally {
    loading.value = false
  }
}

const clearFilters = () => {
  keyword.value = ''
  statusFilter.value = ''
  professionFilter.value = ''
  page.value = 1
  fetchOrders()
}

const goDetail = (id) => router.push(`/agency/order/${id}`)

const getStatusLabel = (s) => ({
  pending: '待确认', confirmed: '已确认', in_progress: '进行中',
  completed: '已完成', cancelled: '已取消'
}[s] || s)

const getStatusType = (s) => ({
  pending: 'info', confirmed: 'success', in_progress: 'warning',
  completed: 'success', cancelled: 'danger'
}[s] || 'info')

const formatTime = (t) => {
  if (!t) return ''
  return new Date(t).toLocaleString('zh-CN')
}

onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.agency-orders {
  padding: 0;
}

.detail-nav {
  margin-bottom: 12px;
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

.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
