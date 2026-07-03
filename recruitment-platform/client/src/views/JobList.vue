<template>
  <div class="job-list">
    <div class="search-bar">
      <el-input
        v-model="keyword"
        placeholder="搜索职位名称或公司"
        clearable
        class="search-input"
        @keyup.enter="fetchJobs"
      >
        <template #append>
          <el-button @click="fetchJobs">搜索</el-button>
        </template>
      </el-input>
      <el-select v-model="category" placeholder="职位分类" clearable class="filter-select">
        <el-option label="技术开发" value="技术开发" />
        <el-option label="产品运营" value="产品运营" />
        <el-option label="设计" value="设计" />
      </el-select>
      <el-select v-model="location" placeholder="工作地点" clearable class="filter-select">
        <el-option label="北京" value="北京" />
        <el-option label="上海" value="上海" />
        <el-option label="深圳" value="深圳" />
        <el-option label="杭州" value="杭州" />
        <el-option label="成都" value="成都" />
      </el-select>
    </div>

    <div class="job-cards">
      <el-card
        v-for="job in jobList"
        :key="job.id"
        class="job-card"
        @click="$router.push(`/job/${job.id}`)"
      >
        <div class="card-header">
          <h3 class="job-title">{{ job.title }}</h3>
          <span class="salary">{{ job.salary }}</span>
        </div>
        <div class="card-body">
          <div class="basic-info">
            <span class="company">{{ job.company }}</span>
            <span class="tag">{{ job.location }}</span>
            <span class="tag">{{ job.experience }}</span>
            <span class="tag">{{ job.education }}</span>
          </div>
          <p class="description">{{ job.description }}</p>
          <div class="card-footer">
            <span class="category">{{ job.category }}</span>
            <span class="apply-btn">查看详情</span>
          </div>
        </div>
      </el-card>
    </div>

    <div class="pagination-container">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="size"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="fetchJobs"
        @current-change="fetchJobs"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { jobApi } from '../api'

const keyword = ref('')
const category = ref('')
const location = ref('')
const page = ref(1)
const size = ref(10)
const jobList = ref([])
const total = ref(0)

const fetchJobs = async () => {
  try {
    const params = {
      keyword: keyword.value,
      category: category.value,
      location: location.value,
      page: page.value,
      size: size.value
    }
    const res = await jobApi.list(params)
    if (res.data.code === 200) {
      jobList.value = res.data.data.list
      total.value = res.data.data.total
    }
  } catch (error) {
    console.error('获取职位列表失败:', error)
  }
}

onMounted(fetchJobs)
</script>

<style scoped>
.job-list {
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

.job-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.job-card {
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.job-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.job-title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.salary {
  font-size: 20px;
  font-weight: bold;
  color: #f56c6c;
}

.basic-info {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.company {
  color: #606266;
  font-weight: 500;
}

.tag {
  background-color: #ecf5ff;
  color: #409eff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.description {
  color: #909399;
  font-size: 14px;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 12px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category {
  color: #909399;
  font-size: 12px;
}

.apply-btn {
  color: #409eff;
  font-size: 14px;
  font-weight: 500;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}
</style>
