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
        <el-menu-item
          :index="'/dashboard'"
        >
          <el-icon :size="16">
            <Histogram />
          </el-icon>
          <template #title>仪表板</template>
        </el-menu-item>
        <el-menu-item
          :index="'/menu'"
        >
          <el-icon :size="16">
            <Menu />
          </el-icon>
          <template #title>菜单管理</template>
        </el-menu-item>
        <el-menu-item
          :index="'/department'"
        >
          <el-icon :size="16">
            <OfficeBuilding />
          </el-icon>
          <template #title>部门管理</template>
        </el-menu-item>
        <el-menu-item
          :index="'/dict'"
        >
          <el-icon :size="16">
            <Table />
          </el-icon>
          <template #title>数据字典</template>
        </el-menu-item>
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
      </el-header>

      <!-- 内容区域 -->
      <el-main class="content-container">
        <!-- 路由视图 -->
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAppStore } from '../stores/app'
import {
  Setting,
  Menu,
  OfficeBuilding,
  Table,
  Histogram
} from '@element-plus/icons-vue'

const appStore = useAppStore()

// 响应式数据
const sidebarOpened = ref(true)

// 方法
const toggleSidebar = () => {
  sidebarOpened.value = !sidebarOpened.value
}
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
  transition: width 0.3s ease;
  background-color: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color);
}

.sidebar-closed {
  transition: width 0.3s ease;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  border-bottom: 1px solid var(--el-border-color);
}

.logo-icon {
  margin-right: 8px;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.sidebar-menu {
  height: calc(100% - 64px);
  border-right: none;
}

/* 主容器样式 */
.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background-color: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color);
}

.sidebar-toggle-btn {
  font-size: 20px;
  padding: 8px 12px;
  color: var(--el-text-color-primary);
}

/* 内容区域样式 */
.content-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: var(--el-bg-color);
}
</style>