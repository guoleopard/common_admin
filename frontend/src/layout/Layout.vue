<template>
  <div class="app-container" :class="{ 'dark-theme': appStore.theme === 'dark' }">
    <!-- 侧边栏 -->
    <el-aside :width="sidebarWidth" class="sidebar-container">
      <div class="sidebar-header">
        <el-icon size="24" class="logo-icon"><Setting /></el-icon>
        <span v-if="!appStore.sidebarCollapse" class="logo-text">后台管理</span>
      </div>
      <el-menu
        :default-active="$route.path"
        class="sidebar-menu"
        mode="vertical"
        background-color="var(--el-bg-color)"
        text-color="var(--el-text-color-primary)"
        active-text-color="var(--el-color-primary)"
        :collapse="appStore.sidebarCollapse"
        router
      >
        <el-menu-item
          v-for="item in $router.options.routes[0].children"
          :key="item.path"
          :index="item.path"
        >
          <template #title>{{ item.meta.title }}</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主内容区域 -->
    <div class="main-container">
      <!-- 顶部导航栏 -->
      <el-header class="header-container">
        <div class="header-left">
          <el-button
            @click="appStore.toggleSidebar()"
            icon="Menu"
            circle
            size="small"
          ></el-button>
        </div>
        <div class="header-right">
          <el-button
            @click="appStore.toggleTheme()"
            :icon="appStore.theme === 'light' ? 'Moon' : 'Sunny'"
            circle
            size="small"
          ></el-button>
        </div>
      </el-header>

      <!-- 内容区域 -->
      <el-main class="content-container">
        <router-view />
      </el-main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '../store'

const appStore = useAppStore()

// 计算侧边栏宽度
const sidebarWidth = computed(() => {
  return appStore.sidebarCollapse ? '60px' : '200px'
})

// 初始化主题
appStore.initTheme()
</script>

<style>
/* 确保页面占满整个浏览器窗口 */
html, body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>

<style scoped>
.app-container {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.sidebar-container {
  background-color: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color);
  transition: width 0.3s;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  border-bottom: 1px solid var(--el-border-color);
}

.logo-icon {
  margin-right: 8px;
}

.logo-text {
  font-size: 18px;
  font-weight: bold;
  color: var(--el-color-primary);
}

.sidebar-menu {
  border: none;
}

/* 修正菜单图标样式 */
.sidebar-menu .el-menu-item {
  display: flex;
  align-items: center;
}

.sidebar-menu .el-menu-item .el-icon {
  margin-right: 8px;
  font-size: 14px;
}

/* 折叠状态下的菜单图标样式 */
.sidebar-menu.is-collapse .el-menu-item .el-icon {
  margin-right: 0;
  font-size: 16px;
}

.main-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  background-color: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color);
  padding: 0 20px;
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
}

.content-container {
  flex: 1;
  overflow: auto;
  padding: 20px;
}

/* 暗色主题样式 */
.dark-theme {
  --el-bg-color: #1a1a1a;
  --el-text-color-primary: #e5e7eb;
  --el-border-color: #374151;
}
</style>