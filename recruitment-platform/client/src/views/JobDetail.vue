<template>
  <div class="job-detail">
    <el-card v-if="job">
      <div class="detail-header">
        <div>
          <h1 class="job-title">{{ job.title }}</h1>
          <span class="salary">{{ job.salary }}</span>
        </div>
        <div class="header-actions">
          <el-button @click="$router.push(`/applications/${job.id}`)">查看投递({{ applicationCount }})</el-button>
          <el-button @click="$router.push(`/job/${job.id}/edit`)">编辑职位</el-button>
        </div>
      </div>

      <div class="basic-info">
        <span class="info-item">{{ job.company }}</span>
        <span class="info-divider">|</span>
        <span class="info-item">{{ job.location }}</span>
        <span class="info-divider">|</span>
        <span class="info-item">{{ job.experience }}</span>
        <span class="info-divider">|</span>
        <span class="info-item">{{ job.education }}</span>
        <span class="info-divider">|</span>
        <span class="info-item">{{ job.category }}</span>
      </div>

      <div class="section">
        <h3 class="section-title">职位描述</h3>
        <p class="section-content">{{ job.description }}</p>
      </div>

      <div class="section">
        <h3 class="section-title">任职要求</h3>
        <p class="section-content">{{ job.requirements }}</p>
      </div>

      <div class="apply-section">
        <el-button type="primary" size="large" @click="showApplyForm = true">立即投递</el-button>
      </div>
    </el-card>

    <el-dialog title="投递简历" v-model="showApplyForm" width="600px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="姓名" prop="candidateName">
          <el-input v-model="form.candidateName" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="学历">
          <el-select v-model="form.education" placeholder="请选择学历">
            <el-option label="大专" value="大专" />
            <el-option label="本科" value="本科" />
            <el-option label="硕士" value="硕士" />
            <el-option label="博士" value="博士" />
          </el-select>
        </el-form-item>
        <el-form-item label="工作经验">
          <el-input v-model="form.experience" placeholder="如：3年" />
        </el-form-item>
        <el-form-item label="技能标签">
          <el-input v-model="form.skills" placeholder="多个技能用逗号分隔" />
        </el-form-item>
        <el-form-item label="期望薪资">
          <el-input v-model="form.expectSalary" placeholder="如：20K" />
        </el-form-item>
        <el-form-item label="简历内容">
          <el-input v-model="form.resume" type="textarea" :rows="4" placeholder="请简要描述您的工作经历和能力" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showApplyForm = false">取消</el-button>
        <el-button type="primary" @click="submitApplication">确认投递</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { jobApi, applicationApi } from '../api'

const route = useRoute()
const job = ref(null)
const applicationCount = ref(0)
const showApplyForm = ref(false)
const formRef = ref(null)

const form = ref({
  jobId: 0,
  candidateName: '',
  phone: '',
  email: '',
  education: '',
  experience: '',
  skills: '',
  resume: '',
  expectSalary: ''
})

const rules = {
  candidateName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入电话', trigger: 'blur' }],
  email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }]
}

const fetchJob = async () => {
  try {
    const res = await jobApi.get(route.params.id)
    if (res.data.code === 200) {
      job.value = res.data.data
      form.value.jobId = res.data.data.id
      fetchApplicationCount()
    }
  } catch (error) {
    console.error('获取职位详情失败:', error)
  }
}

const fetchApplicationCount = async () => {
  try {
    const res = await applicationApi.list(job.value.id)
    if (res.data.code === 200) {
      applicationCount.value = res.data.data.total
    }
  } catch (error) {
    console.error('获取投递数量失败:', error)
  }
}

const submitApplication = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const res = await applicationApi.create(form.value)
        if (res.data.code === 200) {
          ElMessage.success('投递成功')
          showApplyForm.value = false
          form.value = {
            jobId: job.value.id,
            candidateName: '',
            phone: '',
            email: '',
            education: '',
            experience: '',
            skills: '',
            resume: '',
            expectSalary: ''
          }
          fetchApplicationCount()
        }
      } catch (error) {
        ElMessage.error('投递失败')
      }
    }
  })
}

onMounted(fetchJob)
</script>

<style scoped>
.job-detail {
  padding: 20px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.job-title {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;
}

.salary {
  font-size: 24px;
  font-weight: bold;
  color: #f56c6c;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.basic-info {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.info-item {
  color: #606266;
}

.info-divider {
  margin: 0 12px;
  color: #ebeef5;
}

.section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 12px;
}

.section-content {
  color: #606266;
  line-height: 1.8;
  font-size: 14px;
}

.apply-section {
  display: flex;
  justify-content: center;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}
</style>
