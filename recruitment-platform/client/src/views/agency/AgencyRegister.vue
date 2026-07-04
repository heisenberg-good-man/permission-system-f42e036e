<template>
  <div class="agency-register">
    <div class="detail-nav">
      <el-button link @click="$router.push('/agency')">← 返回中介服务</el-button>
    </div>

    <el-card>
      <h2 class="page-title">注册为服务人员</h2>
      <p class="page-desc">填写职业信息，注册后可提交实名认证，通过认证即可接单。</p>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        class="register-form"
      >
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入11位手机号" maxlength="11" />
        </el-form-item>
        <el-form-item label="城市" prop="city">
          <el-select v-model="form.city" placeholder="请选择城市">
            <el-option label="北京" value="北京" />
            <el-option label="上海" value="上海" />
            <el-option label="广州" value="广州" />
            <el-option label="深圳" value="深圳" />
          </el-select>
        </el-form-item>
        <el-form-item label="职业类别" prop="profession">
          <el-select v-model="form.profession" placeholder="请选择职业类别">
            <el-option v-for="p in professions" :key="p" :label="p" :value="p" />
          </el-select>
        </el-form-item>
        <el-form-item label="技能标签">
          <el-input v-model="form.skills" placeholder="多个技能用逗号分隔，如：做饭, 带孩子" />
        </el-form-item>
        <el-form-item label="工作经验">
          <el-input v-model="form.experience" placeholder="如：5年" />
        </el-form-item>
        <el-form-item label="期望薪资">
          <el-input v-model="form.expectedSalary" placeholder="如：6000-8000元/月 或 200元/次" />
        </el-form-item>
        <el-form-item label="自我介绍">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请简要介绍您的服务经验、擅长领域等"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="submit">提交注册</el-button>
          <el-button @click="$router.push('/agency')">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { agencyApi } from '../../api'

const router = useRouter()
const professions = ['保姆', '月嫂', '育儿嫂', '护工', '保洁', '维修工', '钟点工', '其他']

const formRef = ref(null)
const submitting = ref(false)
const form = ref({
  name: '', phone: '', city: '', profession: '',
  skills: '', experience: '', expectedSalary: '', description: ''
})

const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  city: [{ required: true, message: '请选择城市', trigger: 'change' }],
  profession: [{ required: true, message: '请选择职业类别', trigger: 'change' }]
}

const submit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      const res = await agencyApi.registerWorker(form.value)
      if (res.data.code === 200) {
        ElMessage.success('注册成功！请继续完成实名认证')
        router.push(`/agency/worker/${res.data.data.id}`)
      } else {
        ElMessage.error(res.data.message || '注册失败')
      }
    } catch (e) {
      console.error('注册失败:', e)
      const msg = e.response?.data?.message || '注册失败'
      ElMessage.error(msg)
    } finally {
      submitting.value = false
    }
  })
}
</script>

<style scoped>
.agency-register {
  padding: 0;
}

.detail-nav {
  margin-bottom: 12px;
}

.page-title {
  margin: 0 0 8px;
  font-size: 22px;
  color: #303133;
}

.page-desc {
  margin: 0 0 24px;
  color: #909399;
  font-size: 14px;
}

.register-form {
  max-width: 640px;
}
</style>
