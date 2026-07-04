<template>
  <div class="worker-detail">
    <div class="detail-nav">
      <el-button link @click="$router.push('/agency')">← 返回中介服务</el-button>
    </div>

    <el-card v-loading="loading">
      <template v-if="loadError">
        <el-empty :description="loadError">
          <el-button type="primary" @click="fetchWorker">重新加载</el-button>
          <el-button @click="$router.push('/agency')">返回列表</el-button>
        </el-empty>
      </template>
      <template v-else-if="worker">
        <div class="detail-header">
          <div class="header-left">
            <div class="header-top">
              <div class="worker-avatar">{{ worker.name.charAt(0) }}</div>
              <div>
                <h2>{{ worker.name }}</h2>
                <p class="sub-info">{{ worker.profession }} · {{ worker.city }} · 经验{{ worker.experience || '不限' }}</p>
                <div class="header-tags">
                  <el-tag :type="getAuthTagType(worker.authStatus)" size="large">
                    {{ getAuthLabel(worker.authStatus) }}
                  </el-tag>
                  <el-tag :type="worker.status === 'available' ? 'success' : 'warning'" size="large">
                    {{ worker.status === 'available' ? '可接单' : '服务中' }}
                  </el-tag>
                </div>
              </div>
            </div>
          </div>
          <div class="header-actions">
            <el-button
              v-if="worker.authStatus === 'unverified' || worker.authStatus === 'rejected'"
              type="warning"
              @click="openAuthDialog"
            >
              提交实名认证
            </el-button>
            <el-button
              v-if="worker.authStatus === 'pending'"
              type="info"
              @click="openVerifyDialog"
            >
              审核实名认证
            </el-button>
            <el-button
              type="primary"
              :disabled="!canOrder"
              @click="openOrderDialog"
            >
              {{ canOrder ? '立即下单' : orderDisabledReason }}
            </el-button>
          </div>
        </div>

        <el-alert
          v-if="worker.authStatus === 'rejected' && worker.authRemark"
          class="auth-alert"
          :title="'认证未通过：' + worker.authRemark"
          type="error"
          :closable="false"
          show-icon
        />

        <el-row :gutter="20" class="info-section">
          <el-col :span="14">
            <div class="section">
              <h3 class="section-title">服务介绍</h3>
              <p class="section-content">{{ worker.description || '暂无介绍' }}</p>
            </div>
            <div class="section">
              <h3 class="section-title">技能标签</h3>
              <div class="skills-wrap">
                <el-tag v-for="skill in splitSkills(worker.skills)" :key="skill" class="skill-tag">
                  {{ skill }}
                </el-tag>
                <span v-if="!splitSkills(worker.skills).length" class="empty-text">暂无</span>
              </div>
            </div>
            <div class="section">
              <h3 class="section-title">期望薪资</h3>
              <p class="salary-text">{{ worker.expectedSalary || '面议' }}</p>
            </div>
          </el-col>
          <el-col :span="10">
            <div class="section">
              <h3 class="section-title">服务数据</h3>
              <div class="stat-grid">
                <div class="stat-item">
                  <div class="stat-num">{{ worker.rating || '—' }}</div>
                  <div class="stat-label">评分</div>
                </div>
                <div class="stat-item">
                  <div class="stat-num">{{ worker.orderCount }}</div>
                  <div class="stat-label">完成订单</div>
                </div>
              </div>
            </div>
            <div class="section">
              <h3 class="section-title">实名认证信息</h3>
              <div v-if="worker.authInfo" class="auth-info">
                <p><span class="label">真实姓名：</span>{{ maskName(worker.authInfo.realName) }}</p>
                <p><span class="label">身份证号：</span>{{ worker.authInfo.idCard }}</p>
                <p v-if="worker.authTime"><span class="label">认证时间：</span>{{ formatTime(worker.authTime) }}</p>
                <p v-if="worker.authRemark"><span class="label">审核备注：</span>{{ worker.authRemark }}</p>
              </div>
              <p v-else class="empty-text">尚未提交实名认证</p>
            </div>
            <div class="section">
              <h3 class="section-title">联系方式</h3>
              <p class="contact-text">
                <span v-if="worker.authStatus === 'verified'">{{ worker.phone }}</span>
                <span v-else class="empty-text">通过实名认证后可见</span>
              </p>
            </div>
          </el-col>
        </el-row>
      </template>
    </el-card>

    <!-- 实名认证弹窗 -->
    <el-dialog v-model="authDialogVisible" title="提交实名认证" width="480px">
      <el-form :model="authForm" label-width="100px">
        <el-form-item label="真实姓名" required>
          <el-input v-model="authForm.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="身份证号" required>
          <el-input v-model="authForm.idCard" placeholder="请输入18位身份证号" maxlength="18" />
        </el-form-item>
        <el-form-item label="身份证正面">
          <el-input v-model="authForm.idCardFront" placeholder="证件照片标识（演示）" />
        </el-form-item>
        <el-form-item label="身份证背面">
          <el-input v-model="authForm.idCardBack" placeholder="证件照片标识（演示）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="authDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="authLoading" @click="submitAuth">提交认证</el-button>
      </template>
    </el-dialog>

    <!-- 审核认证弹窗 -->
    <el-dialog v-model="verifyDialogVisible" title="审核实名认证" width="480px">
      <div class="verify-info">
        <p><b>姓名：</b>{{ worker?.name }}</p>
        <p><b>真实姓名：</b>{{ worker?.authInfo?.realName }}</p>
        <p><b>身份证号：</b>{{ worker?.authInfo?.idCard }}</p>
      </div>
      <el-form label-width="80px" style="margin-top: 16px">
        <el-form-item label="审核备注">
          <el-input v-model="verifyForm.remark" type="textarea" :rows="2" placeholder="审核备注（可选）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="verifyDialogVisible = false">取消</el-button>
        <el-button type="danger" :loading="verifyLoading" @click="doVerify('reject')">驳回</el-button>
        <el-button type="success" :loading="verifyLoading" @click="doVerify('approve')">通过</el-button>
      </template>
    </el-dialog>

    <!-- 下单弹窗 -->
    <el-dialog v-model="orderDialogVisible" title="在线下单" width="540px">
      <el-form :model="orderForm" label-width="100px">
        <el-form-item label="服务人员">
          <el-input :value="worker?.name + '（' + worker?.profession + '）'" disabled />
        </el-form-item>
        <el-form-item label="客户姓名" required>
          <el-input v-model="orderForm.customerName" placeholder="请输入客户姓名" />
        </el-form-item>
        <el-form-item label="客户手机号" required>
          <el-input v-model="orderForm.customerPhone" placeholder="请输入11位手机号" maxlength="11" />
        </el-form-item>
        <el-form-item label="服务地址" required>
          <el-input v-model="orderForm.customerAddress" placeholder="请输入详细服务地址" />
        </el-form-item>
        <el-form-item label="预约时间">
          <el-date-picker
            v-model="orderForm.scheduledTime"
            type="datetime"
            placeholder="选择预约时间"
            value-format="YYYY-MM-DDTHH:mm:ssZ"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="预算">
          <el-input v-model="orderForm.budget" placeholder="如：300元 或 7000元/月" />
        </el-form-item>
        <el-form-item label="需求描述" required>
          <el-input v-model="orderForm.description" type="textarea" :rows="3" placeholder="请详细描述您的需求" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="orderDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="orderLoading" @click="createOrder">确认下单</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { agencyApi } from '../../api'

const route = useRoute()
const router = useRouter()
const refreshUnreadCount = inject('refreshUnreadCount', () => {})

const worker = ref(null)
const loading = ref(false)
const loadError = ref('')

const authDialogVisible = ref(false)
const authLoading = ref(false)
const authForm = ref({ realName: '', idCard: '', idCardFront: '', idCardBack: '' })

const verifyDialogVisible = ref(false)
const verifyLoading = ref(false)
const verifyForm = ref({ remark: '' })

const orderDialogVisible = ref(false)
const orderLoading = ref(false)
const orderForm = ref({
  customerName: '', customerPhone: '', customerAddress: '',
  description: '', scheduledTime: '', budget: ''
})

const canOrder = computed(() => {
  if (!worker.value) return false
  if (worker.value.authStatus !== 'verified') return false
  if (worker.value.status !== 'available') return false
  return true
})

const orderDisabledReason = computed(() => {
  if (!worker.value) return ''
  if (worker.value.authStatus !== 'verified') return '未通过实名认证'
  if (worker.value.status !== 'available') return '服务人员正在服务中'
  return '立即下单'
})

const fetchWorker = async () => {
  loading.value = true
  loadError.value = ''
  try {
    const res = await agencyApi.getWorker(route.params.id)
    if (res.data.code === 200) {
      worker.value = res.data.data
    } else {
      loadError.value = res.data.message || '获取服务人员详情失败'
    }
  } catch (e) {
    console.error('获取详情失败:', e)
    loadError.value = '网络异常，获取详情失败'
  } finally {
    loading.value = false
  }
}

const openAuthDialog = () => {
  authForm.value = { realName: '', idCard: '', idCardFront: '', idCardBack: '' }
  authDialogVisible.value = true
}

const submitAuth = async () => {
  if (!authForm.value.realName.trim()) {
    ElMessage.warning('请输入真实姓名')
    return
  }
  if (!authForm.value.idCard.trim()) {
    ElMessage.warning('请输入身份证号')
    return
  }
  authLoading.value = true
  try {
    const res = await agencyApi.submitAuth(worker.value.id, authForm.value)
    if (res.data.code === 200) {
      ElMessage.success('实名认证已提交，等待审核')
      authDialogVisible.value = false
      await fetchWorker()
      refreshUnreadCount()
    } else {
      ElMessage.error(res.data.message || '提交失败')
    }
  } catch (e) {
    console.error('提交认证失败:', e)
    const msg = e.response?.data?.message || '提交认证失败'
    ElMessage.error(msg)
  } finally {
    authLoading.value = false
  }
}

const openVerifyDialog = () => {
  verifyForm.value = { remark: '' }
  verifyDialogVisible.value = true
}

const doVerify = async (action) => {
  verifyLoading.value = true
  try {
    const res = await agencyApi.verifyAuth(worker.value.id, {
      action,
      remark: verifyForm.value.remark
    })
    if (res.data.code === 200) {
      ElMessage.success(action === 'approve' ? '已通过实名认证' : '已驳回认证')
      verifyDialogVisible.value = false
      await fetchWorker()
      refreshUnreadCount()
    } else {
      ElMessage.error(res.data.message || '审核失败')
    }
  } catch (e) {
    console.error('审核失败:', e)
    const msg = e.response?.data?.message || '审核失败'
    ElMessage.error(msg)
  } finally {
    verifyLoading.value = false
  }
}

const openOrderDialog = () => {
  if (!canOrder.value) {
    ElMessage.warning(orderDisabledReason.value)
    return
  }
  orderForm.value = {
    customerName: '', customerPhone: '', customerAddress: '',
    description: '', scheduledTime: '', budget: worker.value?.expectedSalary || ''
  }
  orderDialogVisible.value = true
}

const createOrder = async () => {
  const f = orderForm.value
  if (!f.customerName.trim()) return ElMessage.warning('请输入客户姓名')
  if (!f.customerPhone.trim()) return ElMessage.warning('请输入客户手机号')
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(f.customerPhone)) return ElMessage.warning('手机号格式不正确，请输入11位有效手机号')
  if (!f.customerAddress.trim()) return ElMessage.warning('请输入服务地址')
  if (!f.description.trim()) return ElMessage.warning('请输入需求描述')
  orderLoading.value = true
  try {
    const res = await agencyApi.createOrder({
      workerId: worker.value.id,
      ...f
    })
    if (res.data.code === 200) {
      ElMessage.success('下单成功！可在服务订单中查看')
      orderDialogVisible.value = false
      refreshUnreadCount()
      router.push(`/agency/order/${res.data.data.id}`)
    } else {
      ElMessage.error(res.data.message || '下单失败')
    }
  } catch (e) {
    console.error('下单失败:', e)
    const response = e.response
    if (response && response.data) {
      const { code, message, data } = response.data
      if (code === 409 && data?.orderId) {
        ElMessageBox.confirm(
          `${message}，是否跳转到已下单记录页面查看？`,
          '提示',
          {
            type: 'info',
            confirmButtonText: '查看订单',
            cancelButtonText: '留在当前页面'
          }
        ).then(() => {
          router.push(`/agency/order/${data.orderId}`)
        }).catch(() => {})
      } else {
        ElMessage.error(message || '下单失败')
      }
    } else {
      ElMessage.error('网络异常，下单失败')
    }
  } finally {
    orderLoading.value = false
  }
}

const splitSkills = (skills) => {
  if (!skills) return []
  return skills.split(/[,，、\s]+/).filter(s => s)
}

const getAuthLabel = (s) => ({ unverified: '未认证', pending: '审核中', verified: '已认证', rejected: '已驳回' }[s] || s)
const getAuthTagType = (s) => ({ unverified: 'info', pending: 'warning', verified: 'success', rejected: 'danger' }[s] || 'info')

const maskName = (name) => {
  if (!name) return ''
  if (name.length <= 1) return name
  return name.charAt(0) + '*'.repeat(name.length - 1)
}

const formatTime = (t) => {
  if (!t) return ''
  return new Date(t).toLocaleString('zh-CN')
}

onMounted(() => {
  fetchWorker()
})
</script>

<style scoped>
.worker-detail {
  padding: 0;
}

.detail-nav {
  margin-bottom: 12px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 20px;
}

.header-top {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.worker-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: #409eff;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: bold;
  flex-shrink: 0;
}

.detail-header h2 {
  font-size: 22px;
  margin: 0 0 6px;
  color: #303133;
}

.sub-info {
  font-size: 14px;
  color: #909399;
  margin: 0 0 10px;
}

.header-tags {
  display: flex;
  gap: 8px;
}

.header-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.auth-alert {
  margin-bottom: 20px;
}

.info-section {
  margin-top: 8px;
}

.section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px;
  padding-left: 10px;
  border-left: 3px solid #409eff;
}

.section-content {
  color: #606266;
  line-height: 1.8;
  margin: 0;
}

.skills-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.skill-tag {
  margin: 0;
}

.salary-text {
  font-size: 18px;
  font-weight: 600;
  color: #f56c6c;
  margin: 0;
}

.stat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.stat-item {
  background-color: #f5f7fa;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
}

.stat-num {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

.auth-info p,
.contact-text {
  margin: 6px 0;
  color: #606266;
  line-height: 1.8;
}

.label {
  color: #909399;
}

.empty-text {
  color: #c0c4cc;
  font-style: italic;
}

.verify-info p {
  margin: 6px 0;
  color: #606266;
}
</style>
