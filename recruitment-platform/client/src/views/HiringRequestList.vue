<template>
  <div class="hiring-request-page">
    <div class="page-header">
      <div>
        <h2>部门用人需求</h2>
        <p class="sub">部门发起用人申请 → 审批 → 发布职位 → 跟踪到岗进度</p>
      </div>
      <el-button type="primary" @click="openCreateDialog">
        <el-icon><Plus /></el-icon>
        新建需求
      </el-button>
    </div>

    <!-- 筛选条 -->
    <div class="search-bar">
      <el-input v-model="filter.position" placeholder="搜索岗位/需求编号" clearable class="search-input" @keyup.enter="fetchList">
        <template #append>
          <el-button @click="fetchList">搜索</el-button>
        </template>
      </el-input>
      <el-select v-model="filter.department" placeholder="部门" clearable class="filter-select" @change="fetchList">
        <el-option label="技术部" value="技术部" />
        <el-option label="产品部" value="产品部" />
        <el-option label="设计部" value="设计部" />
        <el-option label="运营部" value="运营部" />
      </el-select>
      <el-select v-model="filter.status" placeholder="状态" clearable class="filter-select" @change="fetchList">
        <el-option label="待审批" value="pending" />
        <el-option label="已通过" value="approved" />
        <el-option label="已拒绝" value="rejected" />
        <el-option label="已关闭" value="closed" />
      </el-select>
      <el-select v-model="filter.priority" placeholder="优先级" clearable class="filter-select" @change="fetchList">
        <el-option label="低" value="low" />
        <el-option label="普通" value="normal" />
        <el-option label="紧急" value="urgent" />
      </el-select>
      <el-button @click="resetFilter">重置</el-button>
    </div>

    <!-- 批量操作条 -->
    <div v-if="selectedIds.length > 0" class="batch-bar">
      <span>已选 {{ selectedIds.length }} 项</span>
      <el-button size="small" type="success" @click="batchAction('approve')">批量通过</el-button>
      <el-button size="small" type="danger" @click="batchAction('reject')">批量拒绝</el-button>
      <el-button size="small" type="info" @click="batchAction('close')">批量关闭</el-button>
      <el-button size="small" text @click="clearSelection">取消选择</el-button>
    </div>

    <!-- 列表 -->
    <el-card v-loading="loading">
      <el-table
        :data="list"
        style="width: 100%"
        @selection-change="onSelectionChange"
        empty-text="暂无用人需求，点击右上角新建第一条"
      >
        <el-table-column type="selection" width="50" :selectable="isSelectable" />
        <el-table-column prop="requestNo" label="需求编号" width="130" />
        <el-table-column prop="department" label="部门" width="100" />
        <el-table-column prop="position" label="岗位" min-width="160" />
        <el-table-column label="招聘人数" width="90">
          <template #default="scope">
            <span class="headcount">{{ scope.row.headcount }}</span>
            <span class="headcount-sub"> / 已到岗 {{ scope.row.filledCount || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="level" label="级别" width="80" />
        <el-table-column label="优先级" width="80">
          <template #default="scope">
            <el-tag :type="getPriorityType(scope.row.priority)" size="small">
              {{ getPriorityText(scope.row.priority) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)" size="small">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="applicant" label="申请人" width="110" />
        <el-table-column label="创建时间" width="160">
          <template #default="scope">{{ formatTime(scope.row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="320" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="viewDetail(scope.row)">详情</el-button>
            <el-button size="small" type="primary" @click="openEditDialog(scope.row)" :disabled="scope.row.status === 'closed'">
              编辑
            </el-button>
            <el-dropdown @command="(cmd) => onStatusChange(scope.row, cmd)" :disabled="scope.row.status === 'closed'">
              <el-button size="small" type="success">
                状态切换<el-icon><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="pending" :disabled="scope.row.status === 'pending'">设为待审批</el-dropdown-item>
                  <el-dropdown-item command="approved" :disabled="scope.row.status === 'approved'">通过</el-dropdown-item>
                  <el-dropdown-item command="rejected" :disabled="scope.row.status === 'rejected'">拒绝</el-dropdown-item>
                  <el-dropdown-item command="closed" :disabled="scope.row.status === 'closed'">关闭</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-button
              v-if="scope.row.status === 'approved'"
              size="small"
              type="warning"
              @click="openPublishDialog(scope.row)"
            >
              发布职位
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="size"
          :total="total"
          :page-sizes="[5, 10, 20]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchList"
          @current-change="fetchList"
        />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="formDialogVisible"
      :title="isEditMode ? '编辑用人需求' : '新建用人需求'"
      width="680px"
      @close="resetForm"
    >
      <el-form :model="form" label-width="100px" class="request-form">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="部门" required>
              <el-select v-model="form.department" placeholder="请选择部门" style="width: 100%">
                <el-option label="技术部" value="技术部" />
                <el-option label="产品部" value="产品部" />
                <el-option label="设计部" value="设计部" />
                <el-option label="运营部" value="运营部" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="岗位名称" required>
              <el-input v-model="form.position" placeholder="例如：高级前端工程师" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="招聘人数" required>
              <el-input-number v-model="form.headcount" :min="1" :max="50" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="级别" required>
              <el-select v-model="form.level" placeholder="请选择" style="width: 100%">
                <el-option label="初级" value="初级" />
                <el-option label="中级" value="中级" />
                <el-option label="高级" value="高级" />
                <el-option label="专家" value="专家" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="优先级">
              <el-select v-model="form.priority" style="width: 100%">
                <el-option label="低" value="low" />
                <el-option label="普通" value="normal" />
                <el-option label="紧急" value="urgent" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="薪资范围" required>
              <el-input v-model="form.salaryRange" placeholder="例如：15-25K" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="工作地点" required>
              <el-input v-model="form.location" placeholder="例如：北京" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="申请人" required>
              <el-input v-model="form.applicant" placeholder="申请人姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属类别">
              <el-select v-model="form.category" style="width: 100%">
                <el-option label="技术开发" value="技术开发" />
                <el-option label="产品运营" value="产品运营" />
                <el-option label="设计" value="设计" />
                <el-option label="职能" value="职能" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="用人理由">
              <el-input v-model="form.reason" type="textarea" :rows="2" placeholder="简述为什么招人、业务背景" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="任职要求">
              <el-input v-model="form.requirements" type="textarea" :rows="2" placeholder="学历、经验、技能等" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="formDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="formSaving" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailVisible" title="用人需求详情" width="680px">
      <template v-if="currentDetail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="需求编号">{{ currentDetail.requestNo }}</el-descriptions-item>
          <el-descriptions-item label="部门">{{ currentDetail.department }}</el-descriptions-item>
          <el-descriptions-item label="岗位">{{ currentDetail.position }}</el-descriptions-item>
          <el-descriptions-item label="级别">{{ currentDetail.level }}</el-descriptions-item>
          <el-descriptions-item label="招聘人数">
            {{ currentDetail.headcount }} 人（已到岗 {{ currentDetail.filledCount || 0 }} 人）
          </el-descriptions-item>
          <el-descriptions-item label="优先级">
            <el-tag :type="getPriorityType(currentDetail.priority)" size="small">
              {{ getPriorityText(currentDetail.priority) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="薪资范围">{{ currentDetail.salaryRange }}</el-descriptions-item>
          <el-descriptions-item label="工作地点">{{ currentDetail.location }}</el-descriptions-item>
          <el-descriptions-item label="申请人">{{ currentDetail.applicant }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentDetail.status)" size="small">
              {{ getStatusText(currentDetail.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="用人理由" :span="2">{{ currentDetail.reason || '—' }}</el-descriptions-item>
          <el-descriptions-item label="任职要求" :span="2">{{ currentDetail.requirements || '—' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatTime(currentDetail.createdAt) }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ formatTime(currentDetail.updatedAt) }}</el-descriptions-item>
        </el-descriptions>

        <div class="detail-section">
          <h4>关联职位（{{ (currentDetail.relatedJobs || []).length }}）</h4>
          <el-table v-if="(currentDetail.relatedJobs || []).length" :data="currentDetail.relatedJobs" size="small">
            <el-table-column prop="title" label="职位" />
            <el-table-column prop="company" label="公司" width="160" />
            <el-table-column prop="location" label="地点" width="100" />
            <el-table-column label="状态" width="100">
              <template #default="scope">
                <el-tag size="small" :type="scope.row.status === 'active' ? 'success' : 'info'">
                  {{ scope.row.status === 'active' ? '招聘中' : '已关闭' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-else description="暂无关联职位，可点击「发布职位」创建" :image-size="60" />
        </div>
      </template>
    </el-dialog>

    <!-- 发布职位对话框 -->
    <el-dialog v-model="publishVisible" title="基于需求发布职位" width="520px">
      <template v-if="currentDetail">
        <el-alert type="info" :closable="false" show-icon class="publish-alert">
          将基于「{{ currentDetail.position }}」需求创建新职位，薪资、地点、要求自动带入。
        </el-alert>
        <el-form :model="publishForm" label-width="90px" style="margin-top: 16px">
          <el-form-item label="公司名称" required>
            <el-input v-model="publishForm.company" placeholder="例如：科技有限公司" />
          </el-form-item>
          <el-form-item label="职位描述">
            <el-input v-model="publishForm.description" type="textarea" :rows="3" />
          </el-form-item>
          <el-form-item label="任职要求">
            <el-input v-model="publishForm.requirements" type="textarea" :rows="3" />
          </el-form-item>
        </el-form>
      </template>
      <template #footer>
        <el-button @click="publishVisible = false">取消</el-button>
        <el-button type="primary" :loading="publishLoading" @click="doPublishJob">立即发布</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, ArrowDown } from '@element-plus/icons-vue'
import { hiringRequestApi } from '../api'

const loading = ref(false)
const list = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const selectedIds = ref([])

const filter = reactive({
  position: '',
  department: '',
  status: '',
  priority: ''
})

const fetchList = async () => {
  loading.value = true
  try {
    const res = await hiringRequestApi.list({
      position: filter.position,
      department: filter.department,
      status: filter.status,
      priority: filter.priority,
      page: page.value,
      size: size.value
    })
    if (res.data.code === 200) {
      list.value = res.data.data.list
      total.value = res.data.data.total
      selectedIds.value = []
    } else {
      ElMessage.error(res.data.message || '获取需求列表失败')
    }
  } catch (e) {
    console.error(e)
    ElMessage.error('获取需求列表失败')
  } finally {
    loading.value = false
  }
}

const resetFilter = () => {
  filter.position = ''
  filter.department = ''
  filter.status = ''
  filter.priority = ''
  page.value = 1
  fetchList()
}

const onSelectionChange = (rows) => {
  selectedIds.value = rows.map(r => r.id)
}

const isSelectable = (row) => {
  return row.status !== 'closed'
}

const clearSelection = () => {
  selectedIds.value = []
  // 通过重置key方式较难，简化：重新拉取
  fetchList()
}

// 新增/编辑
const formDialogVisible = ref(false)
const formSaving = ref(false)
const isEditMode = ref(false)
const form = reactive(defaultForm())

function defaultForm() {
  return {
    id: null,
    department: '',
    position: '',
    headcount: 1,
    level: '中级',
    priority: 'normal',
    salaryRange: '',
    location: '',
    applicant: '',
    category: '技术开发',
    reason: '',
    requirements: ''
  }
}

const resetForm = () => {
  Object.assign(form, defaultForm())
}

const openCreateDialog = () => {
  isEditMode.value = false
  resetForm()
  formDialogVisible.value = true
}

const openEditDialog = (row) => {
  isEditMode.value = true
  Object.assign(form, {
    id: row.id,
    department: row.department,
    position: row.position,
    headcount: row.headcount,
    level: row.level,
    priority: row.priority,
    salaryRange: row.salaryRange,
    location: row.location,
    applicant: row.applicant,
    category: row.category,
    reason: row.reason,
    requirements: row.requirements
  })
  formDialogVisible.value = true
}

const submitForm = async () => {
  if (!form.department) return ElMessage.warning('请选择部门')
  if (!form.position.trim()) return ElMessage.warning('请填写岗位名称')
  if (!form.headcount || form.headcount <= 0) return ElMessage.warning('招聘人数必须大于 0')
  if (!form.level) return ElMessage.warning('请选择级别')
  if (!form.salaryRange.trim()) return ElMessage.warning('请填写薪资范围')
  if (!form.location.trim()) return ElMessage.warning('请填写工作地点')
  if (!form.applicant.trim()) return ElMessage.warning('请填写申请人')

  formSaving.value = true
  try {
    const payload = { ...form }
    const res = isEditMode.value
      ? await hiringRequestApi.update(form.id, payload)
      : await hiringRequestApi.create(payload)
    if (res.data.code === 200) {
      ElMessage.success(isEditMode.value ? '更新成功' : '创建成功')
      formDialogVisible.value = false
      fetchList()
    } else {
      ElMessage.error(res.data.message || '保存失败')
    }
  } catch (e) {
    console.error(e)
    ElMessage.error(e.response?.data?.message || '保存失败')
  } finally {
    formSaving.value = false
  }
}

// 状态切换
const onStatusChange = async (row, status) => {
  const text = { pending: '待审批', approved: '通过', rejected: '拒绝', closed: '关闭' }[status]
  try {
    await ElMessageBox.confirm(`确认将「${row.position}」设为"${text}"？`, '状态确认', { type: 'warning' })
  } catch {
    return
  }
  try {
    const res = await hiringRequestApi.updateStatus(row.id, status)
    if (res.data.code === 200) {
      ElMessage.success('状态已更新')
      fetchList()
    } else {
      ElMessage.error(res.data.message || '更新失败')
    }
  } catch (e) {
    ElMessage.error(e.response?.data?.message || '更新失败')
  }
}

// 批量操作
const batchAction = async (action) => {
  if (selectedIds.value.length === 0) return ElMessage.warning('请先勾选需求')
  const map = { approve: '批量通过', reject: '批量拒绝', close: '批量关闭' }
  try {
    await ElMessageBox.confirm(`确认${map[action]}选中的 ${selectedIds.value.length} 条需求？`, '批量操作', { type: 'warning' })
  } catch {
    return
  }
  try {
    const res = await hiringRequestApi.batch(selectedIds.value, action)
    if (res.data.code === 200) {
      const { successCount, failMessages } = res.data.data
      if (failMessages && failMessages.length > 0) {
        ElMessage.warning(`成功 ${successCount} 条，失败 ${failMessages.length} 条：${failMessages.join('；')}`)
      } else {
        ElMessage.success(`${map[action]}成功，共 ${successCount} 条`)
      }
      fetchList()
    } else {
      ElMessage.error(res.data.message || '操作失败')
    }
  } catch (e) {
    ElMessage.error(e.response?.data?.message || '操作失败')
  }
}

// 详情
const detailVisible = ref(false)
const currentDetail = ref(null)

const viewDetail = async (row) => {
  try {
    const res = await hiringRequestApi.get(row.id)
    if (res.data.code === 200) {
      currentDetail.value = res.data.data
      detailVisible.value = true
    } else {
      ElMessage.error(res.data.message || '获取详情失败')
    }
  } catch (e) {
    ElMessage.error('获取详情失败')
  }
}

// 发布职位
const publishVisible = ref(false)
const publishLoading = ref(false)
const publishForm = reactive({ company: '', description: '', requirements: '' })

const openPublishDialog = (row) => {
  currentDetail.value = row
  publishForm.company = '科技有限公司'
  publishForm.description = row.reason || ''
  publishForm.requirements = row.requirements || ''
  publishVisible.value = true
}

const doPublishJob = async () => {
  if (!publishForm.company.trim()) return ElMessage.warning('请填写公司名称')
  publishLoading.value = true
  try {
    const res = await hiringRequestApi.publishJob(currentDetail.value.id, publishForm)
    if (res.data.code === 200) {
      ElMessage.success(`职位「${res.data.data.job.title}」发布成功`)
      publishVisible.value = false
      fetchList()
    } else {
      ElMessage.error(res.data.message || '发布失败')
    }
  } catch (e) {
    ElMessage.error(e.response?.data?.message || '发布失败')
  } finally {
    publishLoading.value = false
  }
}

// 辅助函数
const getStatusText = (s) => ({
  pending: '待审批', approved: '已通过', rejected: '已拒绝', closed: '已关闭'
}[s] || s)

const getStatusType = (s) => ({
  pending: 'warning', approved: 'success', rejected: 'danger', closed: 'info'
}[s] || 'info')

const getPriorityText = (p) => ({ low: '低', normal: '普通', urgent: '紧急' }[p] || p)
const getPriorityType = (p) => ({ low: 'info', normal: '', urgent: 'danger' }[p] || '')

const formatTime = (t) => t ? new Date(t).toLocaleString('zh-CN') : ''

onMounted(fetchList)
</script>

<style scoped>
.hiring-request-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 20px;
}

.page-header h2 {
  font-size: 24px;
  margin: 0 0 6px 0;
  color: #303133;
}

.page-header .sub {
  color: #909399;
  font-size: 13px;
  margin: 0;
}

.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.search-input {
  width: 260px;
}

.filter-select {
  width: 140px;
}

.batch-bar {
  background: #ecf5ff;
  border: 1px solid #b3d8ff;
  color: #409eff;
  padding: 8px 16px;
  border-radius: 4px;
  margin-bottom: 12px;
  display: flex;
  gap: 12px;
  align-items: center;
}

.headcount {
  font-weight: bold;
  color: #303133;
}

.headcount-sub {
  font-size: 12px;
  color: #909399;
}

.request-form {
  padding-top: 8px;
}

.detail-section {
  margin-top: 20px;
}

.detail-section h4 {
  margin: 0 0 12px 0;
  font-size: 15px;
  color: #303133;
}

.publish-alert {
  margin-bottom: 8px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}
</style>
