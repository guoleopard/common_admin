<template>
  <div class="login-container">
    <div class="login-form-wrapper">
      <h2 class="login-title">系统登录</h2>
      <form class="login-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">用户名</label>
          <input 
            type="text" 
            id="username" 
            v-model="loginForm.username" 
            placeholder="请输入用户名" 
            required
          >
        </div>
        
        <div class="form-group">
          <label for="password">密码</label>
          <input 
            type="password" 
            id="password" 
            v-model="loginForm.password" 
            placeholder="请输入密码" 
            required
          >
        </div>
        
        <div class="form-group">
          <label for="captcha">验证码</label>
          <div class="captcha-container">
            <input 
              type="text" 
              id="captcha" 
              v-model="loginForm.captcha" 
              placeholder="请输入验证码" 
              required
            >
            <canvas 
              ref="captchaCanvas" 
              @click="generateCaptcha" 
              class="captcha-canvas"
            ></canvas>
          </div>
        </div>
        
        <button type="submit" class="login-btn">登录</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loginForm = ref({
  username: '',
  password: '',
  captcha: ''
})
const captchaCode = ref('')
const captchaCanvas = ref(null)

// 生成随机验证码
const generateCaptcha = () => {
  const canvas = captchaCanvas.value
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  const width = canvas.width
  const height = canvas.height
  
  // 清空画布
  ctx.clearRect(0, 0, width, height)
  
  // 生成随机验证码（4位）
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz123456789'
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  captchaCode.value = code
  
  // 设置字体
  ctx.font = '40px Arial'
  ctx.textBaseline = 'middle'
  
  // 绘制验证码文字（每个字符随机位置和颜色）
  for (let i = 0; i < code.length; i++) {
    // 随机颜色
    ctx.fillStyle = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`
    
    // 随机位置和旋转角度
    const x = 5 + i * 35
    const y = height / 2
    const rotation = (Math.random() - 0.5) * 0.5 // 随机旋转角度
    
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(rotation)
    ctx.fillText(code[i], 0, 0)
    ctx.restore()
  }
  
  // 绘制干扰线
  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(Math.floor(Math.random() * width), Math.floor(Math.random() * height))
    ctx.lineTo(Math.floor(Math.random() * width), Math.floor(Math.random() * height))
    ctx.stroke()
  }
  
  // 绘制干扰点
  for (let i = 0; i < 50; i++) {
    ctx.fillStyle = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`
    ctx.beginPath()
    ctx.arc(Math.floor(Math.random() * width), Math.floor(Math.random() * height), 1, 0, Math.PI * 2)
    ctx.fill()
  }
}

// 处理登录
const handleLogin = () => {
  // 验证验证码
  if (loginForm.value.captcha.toLowerCase() !== captchaCode.value.toLowerCase()) {
    alert('验证码错误')
    generateCaptcha() // 重新生成验证码
    loginForm.value.captcha = ''
    return
  }
  
  // 这里可以添加实际的登录逻辑，比如调用API
  console.log('登录信息:', loginForm.value)
  
  // 登录成功后跳转到主页面
  router.push('/home')
}

// 组件挂载时生成验证码
onMounted(() => {
  generateCaptcha()
})
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.login-form-wrapper {
  background-color: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.login-title {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #555;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #409eff;
}

.captcha-container {
  display: flex;
  gap: 10px;
}

.captcha-container input {
  flex: 1;
}

.captcha-canvas {
  width: 100px;
  height: 40px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  background-color: #fafafa;
}

.login-btn {
  width: 100%;
  padding: 12px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-btn:hover {
  background-color: #66b1ff;
}
</style>