<template>
  <div class="profile-container">
    <el-card class="profile-card" shadow="hover">
      <div class="profile-header">
        <div class="avatar-box">
          <el-avatar :size="120" :src="userInfo.avatar || defaultAvatar">
            {{ userInfo.username?.charAt(0)?.toUpperCase() || 'U' }}
          </el-avatar>
          <el-button type="primary" size="small" class="avatar-btn" @click="changeAvatar">
            <el-icon><Camera /></el-icon>
            更换头像
          </el-button>
        </div>
        <div class="user-info">
          <h2>{{ userInfo.username || '未知用户' }}</h2>
          <p class="user-role">{{ userInfo.roleName || '普通用户' }}</p>
          <p class="user-email">{{ userInfo.email || '未设置邮箱' }}</p>
          <p class="user-phone">{{ userInfo.phone || '未设置手机号' }}</p>
        </div>
      </div>
    </el-card>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card class="info-card" shadow="hover">
          <template #header>
            <span class="card-title">基本信息</span>
          </template>
          <el-form
            ref="baseFormRef"
            :model="baseForm"
            :rules="baseRules"
            label-width="100px"
            size="default"
          >
            <el-form-item label="用户名" prop="username">
              <el-input v-model="baseForm.username" placeholder="请输入用户名" disabled />
            </el-form-item>
            <el-form-item label="真实姓名" prop="realName">
              <el-input v-model="baseForm.realName" placeholder="请输入真实姓名" />
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="baseForm.email" placeholder="请输入邮箱" />
            </el-form-item>
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="baseForm.phone" placeholder="请输入手机号" />
            </el-form-item>
            <el-form-item label="性别" prop="gender">
              <el-select v-model="baseForm.gender" placeholder="请选择性别">
                <el-option label="男" value="1" />
                <el-option label="女" value="2" />
                <el-option label="保密" value="0" />
              </el-select>
            </el-form-item>
            <el-form-item label="出生日期" prop="birthday">
              <el-date-picker
                v-model="baseForm.birthday"
                type="date"
                placeholder="请选择出生日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
            <el-form-item label="个人简介" prop="introduction">
              <el-input
                v-model="baseForm.introduction"
                placeholder="请输入个人简介"
                type="textarea"
                :rows="3"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveBaseInfo" :loading="baseLoading">
                保存修改
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card class="info-card" shadow="hover">
          <template #header>
            <span class="card-title">安全设置</span>
          </template>
          <el-form
            ref="securityFormRef"
            :model="securityForm"
            :rules="securityRules"
            label-width="100px"
            size="default"
          >
            <el-form-item label="原密码" prop="oldPassword">
              <el-input
                v-model="securityForm.oldPassword"
                type="password"
                placeholder="请输入原密码"
                show-password
              />
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input
                v-model="securityForm.newPassword"
                type="password"
                placeholder="请输入新密码"
                show-password
              />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input
                v-model="securityForm.confirmPassword"
                type="password"
                placeholder="请确认新密码"
                show-password
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="changePassword" :loading="securityLoading">
                修改密码
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>

    <!-- 头像上传对话框 -->
    <el-dialog
      v-model="avatarDialogVisible"
      title="更换头像"
      width="400px"
      :before-close="handleAvatarDialogClose"
    >
      <div class="avatar-upload-container">
        <el-avatar :size="200" :src="tempAvatar || userInfo.avatar || defaultAvatar">
          {{ userInfo.username?.charAt(0)?.toUpperCase() || 'U' }}
        </el-avatar>
        <el-upload
          class="avatar-uploader"
          action="#"
          :show-file-list="false"
          :before-upload="beforeAvatarUpload"
          :http-request="uploadAvatar"
        >
          <el-button type="primary" size="large" style="margin-top: 20px;">
            <el-icon><Upload /></el-icon>
            选择图片
          </el-button>
        </el-upload>
        <p class="avatar-tip">支持 JPG、PNG 格式，大小不超过 2MB</p>
      </div>
      <template #footer>
        <el-button @click="avatarDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveAvatar" :loading="avatarLoading">
          保存头像
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Camera, Upload } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { updateUserInfo, updatePassword, uploadUserAvatar } from '@/utils/api'

const userStore = useUserStore()
const baseFormRef = ref(null)
const securityFormRef = ref(null)
const baseLoading = ref(false)
const securityLoading = ref(false)
const avatarLoading = ref(false)
const avatarDialogVisible = ref(false)
const tempAvatar = ref('')
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

// 用户信息
const userInfo = computed(() => userStore.userInfo || {})

// 基本信息表单
const baseForm = reactive({
  username: '',
  realName: '',
  email: '',
  phone: '',
  gender: '',
  birthday: '',
  introduction: ''
})

// 基本信息表单验证规则
const baseRules = {
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ]
}

// 安全设置表单
const securityForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 安全设置表单验证规则
const securityRules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== securityForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 初始化表单数据
const initFormData = () => {
  baseForm.username = userInfo.value.username || ''
  baseForm.realName = userInfo.value.realName || ''
  baseForm.email = userInfo.value.email || ''
  baseForm.phone = userInfo.value.phone || ''
  baseForm.gender = userInfo.value.gender || ''
  baseForm.birthday = userInfo.value.birthday || ''
  baseForm.introduction = userInfo.value.introduction || ''
}

// 保存基本信息
const saveBaseInfo = async () => {
  try {
    await baseFormRef.value.validate()
    baseLoading.value = true

    const response = await updateUserInfo(baseForm)
    if (response.code === 200) {
      ElMessage.success('基本信息保存成功')
      // 更新用户信息
      userStore.setUserInfo({ ...userInfo.value, ...baseForm })
    } else {
      ElMessage.error(response.msg || '基本信息保存失败')
    }
  } catch (error) {
    ElMessage.error('基本信息保存失败')
  } finally {
    baseLoading.value = false
  }
}

// 修改密码
const changePassword = async () => {
  try {
    await securityFormRef.value.validate()
    securityLoading.value = true

    const response = await updatePassword({
      oldPassword: securityForm.oldPassword,
      newPassword: securityForm.newPassword
    })

    if (response.code === 200) {
      ElMessage.success('密码修改成功，请重新登录')
      // 清除表单数据
      securityForm.oldPassword = ''
      securityForm.newPassword = ''
      securityForm.confirmPassword = ''
      // 退出登录
      setTimeout(() => {
        userStore.logout()
      }, 1500)
    } else {
      ElMessage.error(response.msg || '密码修改失败')
    }
  } catch (error) {
    ElMessage.error('密码修改失败')
  } finally {
    securityLoading.value = false
  }
}

// 打开头像上传对话框
const changeAvatar = () => {
  tempAvatar.value = ''
  avatarDialogVisible.value = true
}

// 关闭头像上传对话框
const handleAvatarDialogClose = () => {
  tempAvatar.value = ''
  avatarDialogVisible.value = false
}

// 头像上传前验证
const beforeAvatarUpload = (file) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG) {
    ElMessage.error('头像图片只能是 JPG/PNG 格式!')
  }
  if (!isLt2M) {
    ElMessage.error('头像图片大小不能超过 2MB!')
  }
  return isJPG && isLt2M
}

// 上传头像
const uploadAvatar = async (options) => {
  try {
    const formData = new FormData()
    formData.append('avatar', options.file)

    const response = await uploadUserAvatar(formData)
    if (response.code === 200) {
      tempAvatar.value = response.data.avatar
      ElMessage.success('头像上传成功')
    } else {
      ElMessage.error(response.msg || '头像上传失败')
    }
  } catch (error) {
    ElMessage.error('头像上传失败')
  }
}

// 保存头像
const saveAvatar = async () => {
  try {
    if (!tempAvatar.value) {
      ElMessage.error('请先上传头像')
      return
    }

    avatarLoading.value = true
    // 更新用户头像
    const response = await updateUserInfo({ avatar: tempAvatar.value })
    if (response.code === 200) {
      ElMessage.success('头像保存成功')
      // 更新用户信息
      userStore.setUserInfo({ ...userInfo.value, avatar: tempAvatar.value })
      // 关闭对话框
      avatarDialogVisible.value = false
      tempAvatar.value = ''
    } else {
      ElMessage.error(response.msg || '头像保存失败')
    }
  } catch (error) {
    ElMessage.error('头像保存失败')
  } finally {
    avatarLoading.value = false
  }
}

// 组件挂载时初始化表单数据
onMounted(() => {
  initFormData()
})
</script>

<style scoped>
.profile-container {
  padding: 20px;
}

.profile-card {
  margin-bottom: 20px;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 30px;
}

.avatar-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.avatar-btn {
  width: 120px;
}

.user-info {
  flex: 1;
}

.user-info h2 {
  margin: 0 0 10px 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.user-role,
.user-email,
.user-phone {
  margin: 5px 0;
  font-size: 14px;
  color: #606266;
}

.user-role {
  color: #409eff;
  font-weight: 500;
}

.info-card {
  height: 100%;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.avatar-upload-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.avatar-tip {
  margin-top: 15px;
  font-size: 12px;
  color: #909399;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .profile-container {
    padding: 10px;
  }

  .profile-header {
    flex-direction: column;
    text-align: center;
  }

  .user-info h2 {
    font-size: 20px;
  }
}
</style>