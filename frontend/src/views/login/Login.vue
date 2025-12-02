<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h1>系统登录</h1>
        <p>请输入您的账号和密码</p>
      </div>
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        size="large"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            prefix-icon="User"
            clearable
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            show-password
            clearable
          />
        </el-form-item>
        <el-form-item prop="captcha">
          <el-row :gutter="12">
            <el-col :span="14">
              <el-input
                v-model="loginForm.captcha"
                placeholder="请输入验证码"
                prefix-icon="Key"
                clearable
              />
            </el-col>
            <el-col :span="10">
              <div class="captcha-box">
                <img
                  :src="captchaImage"
                  alt="验证码"
                  class="captcha-image"
                  @click="refreshCaptcha"
                />
              </div>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            @click="handleLogin"
            :loading="loading"
            class="login-button"
            block
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const loginFormRef = ref(null)
const loading = ref(false)
const captchaImage = ref('')
const captchaCode = ref('')

const loginForm = reactive({
  username: '',
  password: '',
  captcha: ''
})

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' }
  ]
}

// 生成随机验证码
const generateCaptcha = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// 绘制验证码图片
const drawCaptcha = (code) => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  // 设置画布大小
  canvas.width = 120
  canvas.height = 40
  
  // 绘制背景
  ctx.fillStyle = `rgb(${Math.floor(Math.random() * 50)}, ${Math.floor(Math.random() * 50)}, ${Math.floor(Math.random() * 50)})`
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  
  // 绘制干扰线
  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle = `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`
    ctx.lineWidth = Math.random() * 2 + 1
    ctx.beginPath()
    ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height)
    ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height)
    ctx.stroke()
  }
  
  // 绘制干扰点
  for (let i = 0; i < 30; i++) {
    ctx.fillStyle = `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`
    ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2)
  }
  
  // 绘制验证码
  ctx.font = 'bold 24px Arial'
  ctx.textBaseline = 'middle'
  
  for (let i = 0; i < code.length; i++) {
    const x = (canvas.width - 10) / code.length * i + 10
    const y = canvas.height / 2
    const angle = (Math.random() - 0.5) * 0.5 // 随机旋转角度
    
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(angle)
    ctx.fillStyle = `rgb(${Math.floor(Math.random() * 150) + 50}, ${Math.floor(Math.random() * 150) + 50}, ${Math.floor(Math.random() * 150) + 50})`
    ctx.fillText(code[i], 0, 0)
    ctx.restore()
  }
  
  return canvas.toDataURL()
}

// 刷新验证码
const refreshCaptcha = () => {
  const code = generateCaptcha()
  captchaCode.value = code
  captchaImage.value = drawCaptcha(code)
}

// 处理登录
const handleLogin = async () => {
  try {
    // 表单验证
    await loginFormRef.value.validate()
    
    // 验证验证码
    if (loginForm.captcha.toLowerCase() !== captchaCode.value.toLowerCase()) {
      ElMessage.error('验证码错误')
      // 刷新验证码
      refreshCaptcha()
      return
    }
    
    loading.value = true

    // 调用登录接口
    const response = await userStore.login({
      username: loginForm.username,
      password: loginForm.password,
      captcha: loginForm.captcha
    })

    if (response.code === 200) {
      ElMessage.success('登录成功')
      // 跳转到首页
      router.push('/')
    } else {
      ElMessage.error(response.msg || '登录失败')
      // 刷新验证码
      refreshCaptcha()
    }
  } catch (error) {
    if (error.name === 'Error') {
      ElMessage.error(error.message)
    } else {
      ElMessage.error('登录失败')
    }
    // 刷新验证码
    refreshCaptcha()
  } finally {
    loading.value = false
  }
}

// 组件挂载时获取验证码
onMounted(() => {
  refreshCaptcha()
})
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  width: 400px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h1 {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.login-header p {
  font-size: 14px;
  color: #909399;
}

.login-form {
  margin-top: 20px;
}

.captcha-box {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 40px;
}

.captcha-image {
  width: 100%;
  height: 40px;
  border-radius: 6px;
  cursor: pointer;
  object-fit: cover;
}

.login-button {
  height: 48px;
  font-size: 16px;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-box {
    width: 90%;
    padding: 30px 20px;
  }

  .login-header h1 {
    font-size: 24px;
  }
}
</style>