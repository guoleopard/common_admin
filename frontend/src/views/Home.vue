<template>
  <div class="home-container" :class="{ dark: isDark }">
    <el-card class="welcome-card">
      <div class="welcome-title">
        <el-icon :size="48"><House /></el-icon>
        <h1>欢迎使用通用后台管理系统</h1>
      </div>
      <p class="welcome-desc">这是一个基于 Vue 3 + Vite + Element Plus 构建的现代化后台管理系统</p>
      <div class="stats-grid">
        <el-statistic
          title="用户总数"
          :value="1258"
          suffix="人"
          :value-style="{ color: '#409eff' }"
        />
        <el-statistic
          title="角色总数"
          :value="24"
          suffix="个"
          :value-style="{ color: '#67c23a' }"
        />
        <el-statistic
          title="菜单总数"
          :value="156"
          suffix="个"
          :value-style="{ color: '#e6a23c' }"
        />
        <el-statistic
          title="今日访问"
          :value="892"
          suffix="次"
          :value-style="{ color: '#f56c6c' }"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { useThemeStore } from '../store/modules/theme'
import { House } from '@element-plus/icons-vue'
import { ref, onMounted } from 'vue'

const themeStore = useThemeStore()
const isDark = ref(themeStore.isDark)

onMounted(() => {
  isDark.value = themeStore.isDark
})
</script>

<style scoped>
.home-container {
  width: 100%;
  height: 100%;
}

.welcome-card {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

.welcome-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 16px;
}

.welcome-title h1 {
  margin: 0;
  font-size: 28px;
  color: #303133;
}

.home-container.dark .welcome-title h1 {
  color: #fff;
}

.welcome-desc {
  font-size: 16px;
  color: #606266;
  margin-bottom: 32px;
}

.home-container.dark .welcome-desc {
  color: #909399;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 32px;
}
</style>