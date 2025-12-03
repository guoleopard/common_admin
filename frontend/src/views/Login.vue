<template>
  <div class="login-container" :class="{ dark: isDark }">
    <el-card class="login-card">
      <div class="login-header">
        <h1>通用后台管理系统</h1>
        <p>欢迎登录</p>
      </div>
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" class="login-form">
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            prefix-icon="User"
            size="large"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            size="large"
            show-password
          />
        </el-form-item>
        <el-form-item prop="captcha">
          <div class="captcha-container">
            <el-input
              v-model="loginForm.captcha"
              placeholder="请输入验证码"
              prefix-icon="Ticket"
              size="large"
            />
            <div class="captcha-img" @click="refreshCaptcha">
              <canvas ref="captchaCanvas" width="180" height="40" class="captcha-canvas"></canvas>
            </div>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" class="login-btn" @click="handleLogin" :loading="loading">
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useThemeStore } from '../store/modules/theme'

const themeStore = useThemeStore()
const router = useRouter()
const isDark = ref(themeStore.isDark)
const loading = ref(false)
const loginFormRef = ref(null)

const loginForm = ref({
  username: '',
  password: '',
  captcha: ''
})

const loginRules = ref({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' }
  ]
})

const captchaCanvas = ref(null)
const captchaCode = ref('')

// 生成随机验证码
const generateCaptcha = () => {
  const chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz0123456789'
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  console.log(code)
  return code
}

// 绘制验证码
const drawCaptcha = (code) => {
  if (!captchaCanvas.value) return
  const ctx = captchaCanvas.value.getContext('2d')
  // 清空画布
  ctx.clearRect(0, 0, captchaCanvas.value.width, captchaCanvas.value.height)
  
  // 绘制背景
  ctx.fillStyle = '#f5f7fa'
  ctx.fillRect(0, 0, captchaCanvas.value.width, captchaCanvas.value.height)
  
  // 绘制干扰线
  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`
    ctx.beginPath()
    ctx.moveTo(Math.random() * captchaCanvas.value.width, Math.random() * captchaCanvas.value.height)
    ctx.lineTo(Math.random() * captchaCanvas.value.width, Math.random() * captchaCanvas.value.height)
    ctx.stroke()
  }
  
  // 绘制干扰点
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`
    ctx.beginPath()
    ctx.arc(Math.random() * captchaCanvas.value.width, Math.random() * captchaCanvas.value.height, 1, 0, 2 * Math.PI)
    ctx.fill()
  }
  
  // 绘制验证码文字
  ctx.textBaseline = 'middle'
  const fontSize = 20
  ctx.font = `${fontSize}px Arial`
  for (let i = 0; i < code.length; i++) {
    const x = 0 + i * (captchaCanvas.value.width - 60) / code.length
    const y = captchaCanvas.value.height / 2
    ctx.fillStyle = `rgb(${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 100)})`
    ctx.save()
    // 文字倾斜
    ctx.translate(x, y)
    ctx.rotate((Math.random() - 0.5) * 0.5)
    ctx.fillText(code[i], 0, 0)
    ctx.restore()
  }
}

const refreshCaptcha = () => {
  captchaCode.value = generateCaptcha()
  drawCaptcha(captchaCode.value)
}

const handleLogin = () => {
  loginFormRef.value.validate((valid) => {
    if (valid) {
      // 验证验证码
      if (loginForm.value.captcha.toLowerCase() !== captchaCode.value.toLowerCase()) {
        ElMessage.error('验证码错误')
        refreshCaptcha()
        return false
      }
      loading.value = true
      // 模拟登录接口请求
      setTimeout(() => {
        loading.value = false
        // 存储登录状态
        sessionStorage.setItem('token', 'admin_token')
        ElMessage.success('登录成功')
        router.push('/home')
      }, 1000)
    } else {
      ElMessage.error('请完善登录信息')
      return false
    }
  })
}

onMounted(() => {
  isDark.value = themeStore.isDark
  refreshCaptcha()
})
</script>

<style scoped>
.login-container {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-container.dark {
  background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
}

.login-card {
  width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-header h1 {
  margin: 0 0 8px 0;
  font-size: 24px;
  color: #303133;
}

.login-container.dark .login-header h1 {
  color: #fff;
}

.login-header p {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.login-container.dark .login-header p {
  color: #909399;
}

.login-form {
  margin: 0 20px;
}

.captcha-container {
  display: flex;
  gap: 12px;
  align-items: center;
}

.captcha-img {
  width: 180px;
  height: 40px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  overflow: hidden;
}

.captcha-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.login-btn {
  width: 100%;
}
</style>