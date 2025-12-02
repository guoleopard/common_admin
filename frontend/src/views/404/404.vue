<template>
  <div class="not-found-container">
    <div class="not-found-box">
      <div class="not-found-icon">
        <el-icon size="120" color="#909399">
          <DocumentRemove />
        </el-icon>
      </div>
      <div class="not-found-content">
        <h1 class="not-found-title">404</h1>
        <p class="not-found-subtitle">页面不存在</p>
        <p class="not-found-description">抱歉，您访问的页面不存在或已被删除。</p>
        <div class="not-found-actions">
          <el-button type="primary" size="large" @click="goBack">
            <el-icon><ArrowLeft /></el-icon>
            返回上一页
          </el-button>
          <el-button size="large" @click="goHome">
            <el-icon><House /></el-icon>
            回到首页
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ArrowLeft, DocumentRemove, House } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 返回上一页
const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    goHome()
  }
}

// 回到首页
const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.not-found-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 40px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  max-width: 500px;
  width: 90%;
}

.not-found-icon {
  margin-bottom: 30px;
}

.not-found-content {
  text-align: center;
}

.not-found-title {
  margin: 0 0 10px 0;
  font-size: 64px;
  font-weight: 700;
  color: #303133;
  line-height: 1;
}

.not-found-subtitle {
  margin: 0 0 15px 0;
  font-size: 24px;
  font-weight: 600;
  color: #606266;
}

.not-found-description {
  margin: 0 0 30px 0;
  font-size: 14px;
  color: #909399;
  line-height: 1.6;
}

.not-found-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .not-found-box {
    padding: 40px 20px;
  }

  .not-found-title {
    font-size: 48px;
  }

  .not-found-subtitle {
    font-size: 20px;
  }

  .not-found-actions {
    flex-direction: column;
    width: 100%;
  }

  .not-found-actions .el-button {
    width: 100%;
  }
}
</style>