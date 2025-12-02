<template>
  <div class="home-container" :class="{ dark: isDark }">
    <!-- 欢迎卡片 -->
    <el-card class="welcome-card">
      <div class="welcome-title">
        <el-icon :size="48"><House /></el-icon>
        <h1>欢迎回来，管理员</h1>
      </div>
      <p class="welcome-desc">当前时间：{{ currentTime }}</p>
    </el-card>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <el-card class="stat-card">
        <div class="stat-icon blue">
          <el-icon :size="32"><User /></el-icon>
        </div>
        <el-statistic
          title="用户总数"
          :value="1258"
          suffix="人"
          :value-style="{ color: '#409eff', fontSize: '24px', fontWeight: 'bold' }"
        />
        <div class="stat-change positive">
          <el-icon><TrendCharts /></el-icon>
          <span>较昨日 +12</span>
        </div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-icon green">
          <el-icon :size="32"><UserFilled /></el-icon>
        </div>
        <el-statistic
          title="角色总数"
          :value="24"
          suffix="个"
          :value-style="{ color: '#67c23a', fontSize: '24px', fontWeight: 'bold' }"
        />
        <div class="stat-change positive">
          <el-icon><TrendCharts /></el-icon>
          <span>较上月 +2</span>
        </div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-icon orange">
          <el-icon :size="32"><Menu /></el-icon>
        </div>
        <el-statistic
          title="菜单总数"
          :value="156"
          suffix="个"
          :value-style="{ color: '#e6a23c', fontSize: '24px', fontWeight: 'bold' }"
        />
        <div class="stat-change neutral">
          <el-icon><TrendCharts /></el-icon>
          <span>无变化</span>
        </div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-icon red">
          <el-icon :size="32"><View /></el-icon>
        </div>
        <el-statistic
          title="今日访问"
          :value="892"
          suffix="次"
          :value-style="{ color: '#f56c6c', fontSize: '24px', fontWeight: 'bold' }"
        />
        <div class="stat-change positive">
          <el-icon><TrendCharts /></el-icon>
          <span>较昨日 +23%</span>
        </div>
      </el-card>
    </div>

    <el-row :gutter="20" class="home-row">
      <!-- 快捷操作 -->
      <el-col :span="12">
        <el-card title="快捷操作" class="quick-ops">
          <el-row :gutter="10">
            <el-col :span="8" v-for="op in quickOps" :key="op.name">
              <div class="op-item" @click="handleQuickOp(op)">
                <div class="op-icon" :style="{ backgroundColor: op.color }">
                  <el-icon :size="24"><component :is="op.icon" /></el-icon>
                </div>
                <span class="op-name">{{ op.name }}</span>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>

      <!-- 最近动态 -->
      <el-col :span="12">
        <el-card title="最近动态" class="recent-activities">
          <el-timeline>
            <el-timeline-item
              v-for="activity in recentActivities"
              :key="activity.time"
              :timestamp="activity.time"
            >
              <template #icon>
                <el-icon :style="{ color: activity.color }">
                  <component :is="activity.icon" />
                </el-icon>
              </template>
              <p>{{ activity.content }}</p>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { useThemeStore } from '../store/modules/theme'
import { useRouter } from 'vue-router'
import { House, User, UserFilled, Menu, View, TrendCharts, Plus, Edit, Delete, Setting, Bell, Document, ShoppingBag } from '@element-plus/icons-vue'
import { ref, onMounted, onUnmounted } from 'vue'

const themeStore = useThemeStore()
const router = useRouter()
const isDark = ref(themeStore.isDark)
const currentTime = ref('')

// 快捷操作
const quickOps = ref([
  { name: '新增用户', icon: 'Plus', color: '#409eff', path: '/system/user' },
  { name: '新增角色', icon: 'Plus', color: '#67c23a', path: '/system/role' },
  { name: '新增菜单', icon: 'Plus', color: '#e6a23c', path: '/system/menu' },
  { name: '用户管理', icon: 'User', color: '#909399', path: '/system/user' },
  { name: '角色管理', icon: 'UserFilled', color: '#909399', path: '/system/role' },
  { name: '菜单管理', icon: 'Menu', color: '#909399', path: '/system/menu' }
])

// 最近动态
const recentActivities = ref([
  { time: '10:30', icon: 'Edit', color: '#409eff', content: '更新了管理员角色权限' },
  { time: '09:15', icon: 'Plus', color: '#67c23a', content: '新增了市场部用户账号' },
  { time: '昨天', icon: 'Delete', color: '#f56c6c', content: '删除了无效的测试账号' },
  { time: '昨天', icon: 'Setting', color: '#e6a23c', content: '修改了系统安全设置' },
  { time: '3天前', icon: 'Bell', color: '#909399', content: '发布了系统更新公告' }
])

const updateCurrentTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const handleQuickOp = (op) => {
  if (op.path) {
    router.push(op.path)
  }
}

onMounted(() => {
  isDark.value = themeStore.isDark
  updateCurrentTime()
  const timer = setInterval(updateCurrentTime, 1000)
  onUnmounted(() => clearInterval(timer))
})
</script>

<style scoped>
.home-container {
  width: 100%;
  height: 100%;
  padding: 20px;
  margin: 0;
}

.welcome-card {
  margin-bottom: 20px;
}

.welcome-title {
  display: flex;
  align-items: center;
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
  margin: 0;
}

.home-container.dark .welcome-desc {
  color: #909399;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.stat-icon.blue {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.green {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.stat-icon.orange {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.red {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-change {
  margin-top: 8px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-change.positive {
  color: #67c23a;
}

.stat-change.negative {
  color: #f56c6c;
}

.stat-change.neutral {
  color: #909399;
}

.home-row {
  margin-bottom: 20px;
}

.quick-ops {
  height: 100%;
}

.op-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  cursor: pointer;
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  transition: all 0.3s;
}

.home-container.dark .op-item {
  border-color: #303030;
}

.op-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.op-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  margin-bottom: 8px;
}

.op-name {
  font-size: 14px;
  color: #303133;
}

.home-container.dark .op-name {
  color: #fff;
}

.recent-activities {
  height: 100%;
}

.el-timeline-item__timestamp {
  font-size: 12px;
}
</style>