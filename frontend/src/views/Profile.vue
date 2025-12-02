<template>
  <div class="profile-container" :class="{ dark: isDark }">
    <el-card class="profile-header">
      <div class="profile-avatar">
        <el-avatar :size="120" :src="userInfo.avatar">
          <UserFilled />
        </el-avatar>
        <div class="profile-info">
          <h2>{{ userInfo.name }}</h2>
          <p class="profile-role">{{ userInfo.role }}</p>
        </div>
      </div>
    </el-card>

    <el-row :gutter="20" class="profile-content">
      <el-col :span="12">
        <el-card title="基本信息" class="info-card">
          <el-form :model="userForm" label-width="100px">
            <el-form-item label="用户名">
              <el-input v-model="userForm.username" disabled />
            </el-form-item>
            <el-form-item label="真实姓名">
              <el-input v-model="userForm.realName" />
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="userForm.email" />
            </el-form-item>
            <el-form-item label="手机号">
              <el-input v-model="userForm.phone" />
            </el-form-item>
            <el-form-item label="部门">
              <el-input v-model="userForm.department" disabled />
            </el-form-item>
            <el-form-item label="入职时间">
              <el-input v-model="userForm.joinTime" disabled />
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card title="修改密码" class="pwd-card">
          <el-form ref="pwdFormRef" :model="pwdForm" :rules="pwdRules" label-width="100px">
            <el-form-item label="原密码" prop="oldPassword">
              <el-input type="password" v-model="pwdForm.oldPassword" show-password />
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input type="password" v-model="pwdForm.newPassword" show-password />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input type="password" v-model="pwdForm.confirmPassword" show-password />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleChangePwd" :loading="pwdLoading">
                修改密码
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card title="安全设置" class="security-card" style="margin-top: 20px;">
          <el-list>
            <el-list-item>
              <template #default>
                <span>登录IP</span>
                <span style="margin-left: auto;">{{ loginInfo.ip }}</span>
              </template>
            </el-list-item>
            <el-list-item>
              <template #default>
                <span>登录地点</span>
                <span style="margin-left: auto;">{{ loginInfo.location }}</span>
              </template>
            </el-list-item>
            <el-list-item>
              <template #default>
                <span>最后登录时间</span>
                <span style="margin-left: auto;">{{ loginInfo.lastLoginTime }}</span>
              </template>
            </el-list-item>
          </el-list>
        </el-card>
      </el-col>
    </el-row>

    <div class="profile-actions">
      <el-button type="primary" @click="handleSave" :loading="saving">
        保存修改
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { UserFilled } from '@element-plus/icons-vue'
import { useThemeStore } from '../store/modules/theme'

const themeStore = useThemeStore()
const isDark = ref(themeStore.isDark)
const saving = ref(false)
const pwdLoading = ref(false)
const pwdFormRef = ref(null)

const userInfo = ref({
  avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
  name: 'admin',
  role: '超级管理员'
})

const userForm = ref({
  username: 'admin',
  realName: '管理员',
  email: 'admin@example.com',
  phone: '13800138000',
  department: '技术部',
  joinTime: '2024-01-01'
})

const pwdForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const pwdRules = ref({
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== pwdForm.value.newPassword) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
})

const loginInfo = ref({
  ip: '192.168.1.100',
  location: '本地局域网',
  lastLoginTime: '2024-05-20 14:30:00'
})

const handleSave = () => {
  saving.value = true
  setTimeout(() => {
    saving.value = false
    ElMessage.success('保存成功')
  }, 1000)
}

const handleChangePwd = () => {
  pwdFormRef.value.validate((valid) => {
    if (valid) {
      pwdLoading.value = true
      setTimeout(() => {
        pwdLoading.value = false
        ElMessage.success('密码修改成功')
        pwdForm.value = {
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        }
      }, 1000)
    } else {
      ElMessage.error('请完善密码信息')
      return false
    }
  })
}

onMounted(() => {
  isDark.value = themeStore.isDark
})
</script>

<style scoped>
.profile-container {
  padding: 20px;
  min-height: 100%;
  background-color: #f5f7fa;
}

.profile-container.dark {
  background-color: #1a1a1a;
}

.profile-header {
  margin-bottom: 20px;
}

.profile-avatar {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 20px;
}

.profile-info h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  color: #303133;
}

.profile-container.dark .profile-info h2 {
  color: #fff;
}

.profile-role {
  margin: 0;
  color: #67c23a;
  font-size: 14px;
}

.profile-content {
  margin-bottom: 20px;
}

.info-card, .pwd-card, .security-card {
  height: 100%;
}

.profile-actions {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.el-list-item {
  justify-content: space-between;
}
</style>