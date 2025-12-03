<template>
  <div class="app-container">
    <!-- 侧边栏 -->
    <el-aside
      :width="sidebarOpened ? '200px' : '64px'"
      class="sidebar-container"
      :class="{ 'sidebar-closed': !sidebarOpened }"
    >
      <div class="sidebar-header">
        <el-icon :size="24" class="logo-icon">
          <Setting />
        </el-icon>
        <span v-if="sidebarOpened" class="logo-text">后台管理</span>
      </div>

      <el-menu
        :default-active="$route.path"
        class="sidebar-menu"
        :collapse="!sidebarOpened"
        background-color="var(--el-bg-color)"
        text-color="var(--el-text-color-primary)"
        active-text-color="var(--el-color-primary)"
        router
      >
        <template v-for="route in $router.options.routes[0].children" :key="route.path">
          <el-sub-menu
            v-if="route.children && route.children.length > 0"
            :index="route.path"
          >
            <template #title>
              <el-icon :size="16">
                <component :is="route.meta.icon" />
              </el-icon>
              <span>{{ route.meta.title }}</span>
            </template>
            <el-menu-item
              v-for="childRoute in route.children"
              :key="childRoute.path"
              :index="childRoute.path"
            >
              <el-icon :size="16">
                <component :is="childRoute.meta.icon" />
              </el-icon>
              <template #title>{{ childRoute.meta.title }}</template>
            </el-menu-item>
          </el-sub-menu>
          <el-menu-item
            v-else
            :index="route.path"
          >
            <el-icon :size="16">
              <component :is="route.meta.icon" />
            </el-icon>
            <template #title>{{ route.meta.title }}</template>
          </el-menu-item>
        </template>
      </el-menu>
    </el-aside>

    <!-- 主内容区域 -->
    <el-container class="main-container">
      <!-- 顶部导航栏 -->
      <el-header class="header-container">
        <el-button
          type="text"
          @click="toggleSidebar"
          class="sidebar-toggle-btn"
        >
          <el-icon :size="24">
            <Menu />
          </el-icon>
        </el-button>

        <div class="header-right">
          <!-- 主题切换按钮 -->
          <el-button
            type="text"
            @click="toggleTheme"
            class="theme-toggle-btn"
          >
            <el-icon :size="24">
              <component :is="currentTheme === 'light' ? 'Moon' : 'Sunny'" />
            </el-icon>
          </el-button>

          <!-- 用户信息 -->
          <el-dropdown trigger="click">
            <span class="user-info">
              <el-icon :size="24" class="user-avatar">
                <User />
              </el-icon>
              <span v-if="sidebarOpened" class="user-name">管理员</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>
                  <el-icon><User /></el-icon>
                  <span>个人中心</span>
                </el-dropdown-item>
                <el-dropdown-item divided>
                  <el-icon><SwitchButton /></el-icon>
                  <span>退出登录</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 内容区域 -->
      <el-main class="content-container">
        <!-- 面包屑导航 -->
        <el-breadcrumb class="breadcrumb" separator="/">
          <el-breadcrumb-item
            v-for="breadcrumb in breadcrumbs"
            :key="breadcrumb.path"
            :to="breadcrumb.path"
          >
            {{ breadcrumb.title }}
          </el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 路由视图 -->
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAppStore } from '../stores/app'
import { useRoute } from 'vue-router'
import {
  Setting,
  Menu,
  Moon,
  Sunny,
  User,
  UserFilled,
  SwitchButton
} from '@element-plus/icons-vue'

const route = useRoute()

const appStore = useAppStore()

// 计算属性
const sidebarOpened = computed(() => appStore.sidebar.opened)
const currentTheme = computed(() => appStore.theme)
const breadcrumbs = computed(() => appStore.breadcrumb)

// 方法
const toggleSidebar = () => {
  appStore.toggleSidebar()
}

const toggleTheme = () => {
  appStore.toggleTheme()
}

// 生成面包屑
const generateBreadcrumbs = (route) => {
  const matched = route.matched
  const breadcrumbs = matched.map(item => ({
    title: item.meta?.title || '',
    path: item.path
  }))
  // 移除根路径
  if (breadcrumbs.length > 0) {
    breadcrumbs.shift()
  }
  appStore.setBreadcrumb(breadcrumbs)
}

// 监听路由变化
watch(
  () => route,
  (newRoute) => {
    generateBreadcrumbs(newRoute)
  },
  { immediate: true }
)

// 组件挂载时应用主题
onMounted(() => {
  appStore.applyTheme()
})
</script>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background-color: var(--el-bg-color);
}

/* 侧边栏样式 */
.sidebar-container {
  background-color: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color);
  transition: width 0.3s ease;
  overflow: hidden;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 60px;
  padding: 0 20px;
  border-bottom: 1px solid var(--el-border-color);
  gap: 12px;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  white-space: nowrap;
}

.sidebar-menu {
  border: none;
  height: calc(100vh - 60px);
}

/* 主内容区域样式 */
.main-container {
  flex: 1;
  overflow: hidden;
}

/* 顶部导航栏样式 */
.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 20px;
  background-color: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.sidebar-toggle-btn {
  margin-right: 16px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 12px;
  border-radius: 20px;
  transition: background-color 0.3s ease;
}

.user-info:hover {
  background-color: var(--el-fill-color-light);
}

.user-name {
  font-size: 14px;
  color: var(--el-text-color-primary);
  white-space: nowrap;
}

/* 内容区域样式 */
.content-container {
  padding: 20px;
  background-color: var(--el-bg-color-page);
  overflow-y: auto;
}

/* 面包屑样式 */
.breadcrumb {
  margin-bottom: 20px;
  padding: 10px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar-container {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    z-index: 999;
  }

  .sidebar-closed {
    transform: translateX(-100%);
  }
}
</style>