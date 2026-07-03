<template>
  <div class="create-job">
    <h2>发布职位</h2>
    <el-card>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="职位名称" prop="title">
          <el-input v-model="form.title" placeholder="请输入职位名称" />
        </el-form-item>
        <el-form-item label="公司名称" prop="company">
          <el-input v-model="form.company" placeholder="请输入公司名称" />
        </el-form-item>
        <el-form-item label="职位分类">
          <el-select v-model="form.category" placeholder="请选择职位分类">
            <el-option label="技术开发" value="技术开发" />
            <el-option label="产品运营" value="产品运营" />
            <el-option label="设计" value="设计" />
            <el-option label="测试" value="测试" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="薪资范围" prop="salary">
          <el-input v-model="form.salary" placeholder="如：15-25K" />
        </el-form-item>
        <el-form-item label="工作地点">
          <el-select v-model="form.location" placeholder="请选择工作地点">
            <el-option label="北京" value="北京" />
            <el-option label="上海" value="上海" />
            <el-option label="深圳" value="深圳" />
            <el-option label="杭州" value="杭州" />
            <el-option label="成都" value="成都" />
            <el-option label="广州" value="广州" />
            <el-option label="武汉" value="武汉" />
            <el-option label="南京" value="南京" />
          </el-select>
        </el-form-item>
        <el-form-item label="经验要求">
          <el-select v-model="form.experience" placeholder="请选择经验要求">
            <el-option label="不限" value="不限" />
            <el-option label="应届生" value="应届生" />
            <el-option label="1-3年" value="1-3年" />
            <el-option label="3-5年" value="3-5年" />
            <el-option label="5-10年" value="5-10年" />
            <el-option label="10年以上" value="10年以上" />
          </el-select>
        </el-form-item>
        <el-form-item label="学历要求">
          <el-select v-model="form.education" placeholder="请选择学历要求">
            <el-option label="不限" value="不限" />
            <el-option label="大专" value="大专" />
            <el-option label="本科" value="本科" />
            <el-option label="硕士" value="硕士" />
            <el-option label="博士" value="博士" />
          </el-select>
        </el-form-item>
        <el-form-item label="职位描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请输入职位描述" />
        </el-form-item>
        <el-form-item label="任职要求" prop="requirements">
          <el-input v-model="form.requirements" type="textarea" :rows="4" placeholder="请输入任职要求" />
        </el-form-item>
        <el-form-item>
          <el-button @click="$router.push('/')">返回列表</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitLoading">发布职位</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { jobApi } from '../api'

const router = useRouter()
const formRef = ref(null)
const submitLoading = ref(false)

const form = ref({
  title: '',
  company: '',
  category: '',
  salary: '',
  location: '',
  experience: '',
  education: '',
  description: '',
  requirements: ''
})

const rules = {
  title: [{ required: true, message: '请输入职位名称', trigger: 'blur' }],
  company: [{ required: true, message: '请输入公司名称', trigger: 'blur' }],
  salary: [{ required: true, message: '请输入薪资范围', trigger: 'blur' }],
  description: [{ required: true, message: '请输入职位描述', trigger: 'blur' }],
  requirements: [{ required: true, message: '请输入任职要求', trigger: 'blur' }]
}

const submitForm = async () => {
  if (!formRef.value || submitLoading.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        const res = await jobApi.create(form.value)
        if (res.data.code === 200) {
          ElMessage.success('发布成功')
          router.push('/')
        } else {
          ElMessage.error(res.data.message || '发布失败')
        }
      } catch (error) {
        console.error('发布失败:', error)
        const msg = error.response?.data?.message || '发布失败'
        ElMessage.error(msg)
      } finally {
        submitLoading.value = false
      }
    }
  })
}
</script>

<style scoped>
.create-job {
  padding: 20px;
}

.create-job h2 {
  margin-bottom: 20px;
  font-size: 24px;
  color: #303133;
}
</style>
