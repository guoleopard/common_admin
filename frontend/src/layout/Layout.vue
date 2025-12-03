<template>
  <div class="admin-layout" :class="{ dark: isDark }" style="height: 100vh">
    <el-container style="height: 100%">
      <el-aside width="200px" class="aside-container" :class="{ dark: isDark }">
        <div class="logo-box">
          <div class="logo">
            <el-icon :size="32"><Setting /></el-icon>
          </div>
          <h2 class="logo-title">通用后台</h2>
        </div>
        <el-menu
          :default-active="activeTab"
          mode="vertical"
          :collapse="isCollapse"
          @select="handleMenuSelect"
          :class="{ dark: isDark }"
          background-color="transparent"
          text-color="#fff"
          active-text-color="#409eff"
        >
          <template v-for="route in menuRoutes" :key="route.path">
            <el-sub-menu
              v-if="route.children && !route.meta.hidden"
              :index="route.path"
            >
              <template #title>
                <el-icon><component :is="route.meta.icon" /></el-icon>
                <span>{{ route.meta.title }}</span>
              </template>
              <template v-for="child in route.children" :key="child.path">
                <el-menu-item
                  :index="route.path === '/' ? `/${child.path}` : `${route.path}/${child.path}`"
                >
                  <el-icon v-if="child.meta.icon"><component :is="child.meta.icon" /></el-icon>
                  <span>{{ child.meta.title }}</span>
                </el-menu-item>
              </template>
            </el-sub-menu>
            <el-menu-item
              v-else-if="!route.meta.hidden"
              :index="route.path"
            >
              <el-icon v-if="route.meta.icon"><component :is="route.meta.icon" /></el-icon>
              <span>{{ route.meta.title }}</span>
            </el-menu-item>
          </template>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header class="header-container" :class="{ dark: isDark }">
          <div class="header-left">
            <el-button
              :icon="isCollapse ? 'Expand' : 'Fold'"
              @click="isCollapse = !isCollapse"
              circle
            />
            <span class="header-title">{{ currentTabTitle }}</span>
          </div>
          <div class="header-right">
            <el-button
              :icon="isDark ? 'Sunny' : 'Moon'"
              @click="toggleTheme"
              circle
            />
            <el-dropdown @command="handleCommand">
              <div class="user-info">
                <el-icon><User /></el-icon>
                <span>管理员</span>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                  <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>
        <el-tabs
          v-model:activeName="activeTab"
          type="card"
          closable
          @tab-remove="handleTabRemove"
          @tab-click="handleTabClick"
          class="tabs-container"
          :class="{ dark: isDark }"
        >
          <el-tab-pane
            v-for="tab in tabs"
            :key="tab.name"
            :label="tab.title"
            :name="tab.name"
          >
            <div
              @contextmenu.prevent="showContextMenu($event, tab)"
              class="tab-content"
            >
              <router-view />
            </div>
          </el-tab-pane>
        </el-tabs>
        <!-- 右键菜单 -->
        <el-dropdown-menu
          v-if="contextMenuVisible"
          :style="{ left: contextMenuLeft + 'px', top: contextMenuTop + 'px' }"
          class="context-menu"
          :class="{ dark: isDark }"
        >
          <el-dropdown-item @click="refreshTab">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-dropdown-item>
          <el-dropdown-item @click="closeOtherTabs">
            <el-icon><Delete /></el-icon>
            关闭其他
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useThemeStore } from '../store/modules/theme'
import { Setting, User, OfficeBuilding, List, Refresh, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const themeStore = useThemeStore()
const isCollapse = ref(false)
const isDark = ref(themeStore.isDark)
const menuRoutes = ref([])
const activeTab = ref('home')
const tabs = ref([
  { name: 'home', title: '首页', component: 'Home' }
])
const contextMenuVisible = ref(false)
const contextMenuLeft = ref(0)
const contextMenuTop = ref(0)
const currentTab = ref(null)

// 计算当前标签页标题
const currentTabTitle = computed(() => {
  const tab = tabs.value.find(t => t.name === activeTab.value)
  return tab ? tab.title : ''
})

onMounted(() => {
  // 获取根路由下的子路由作为菜单数据源
  const rootRoute = router.getRoutes().find(r => r.path === '/')
  if (rootRoute && rootRoute.children) {
    menuRoutes.value = rootRoute.children
  }
})

// 处理菜单选择
const handleMenuSelect = (index) => {
  // 查找对应的路由
  const route = findRouteByPath(index)
  if (!route) return

  // 检查标签页是否已存在
  const existingTab = tabs.value.find(tab => tab.name === index)
  if (!existingTab) {
    // 添加新标签页
    tabs.value.push({
      name: index,
      title: route.meta.title,
      component: route.name
    })
  }

  // 激活当前标签页
  activeTab.value = index

  // 导航到对应的路由
  router.push(index)
}

// 根据路径查找路由
const findRouteByPath = (path) => {
  let foundRoute = null
  const findRoute = (routes) => {
    for (const route of routes) {
      if (route.path === path) {
        foundRoute = route
        return
      }
      if (route.children) {
        findRoute(route.children)
      }
    }
  }
  findRoute(router.getRoutes())
  return foundRoute
}

// 处理标签页关闭
const handleTabRemove = (name) => {
  const index = tabs.value.findIndex(tab => tab.name === name)
  if (index === -1) return

  // 如果关闭的是当前激活的标签页，需要激活前一个或后一个标签页
  if (name === activeTab.value) {
    const newActiveTab = index > 0 ? tabs.value[index - 1].name : (tabs.value[index + 1] ? tabs.value[index + 1].name : 'home')
    activeTab.value = newActiveTab
    router.push(newActiveTab)
  }

  // 移除标签页
  tabs.value.splice(index, 1)
}

// 处理标签页点击
const handleTabClick = (tab) => {
  router.push(tab.name)
}

// 显示右键菜单
const showContextMenu = (event, tab) => {
  contextMenuVisible.value = true
  contextMenuLeft.value = event.clientX
  contextMenuTop.value = event.clientY
  currentTab.value = tab

  // 点击其他地方关闭右键菜单
  setTimeout(() => {
    document.addEventListener('click', closeContextMenu)
  }, 0)
}

// 关闭右键菜单
const closeContextMenu = () => {
  contextMenuVisible.value = false
  document.removeEventListener('click', closeContextMenu)
}

// 刷新当前标签页
const refreshTab = () => {
  if (!currentTab.value) return
  // 这里可以添加刷新逻辑，比如重新获取数据
  ElMessage.info('刷新成功')
  closeContextMenu()
}

// 关闭其他标签页
const closeOtherTabs = () => {
  if (!currentTab.value) return
  tabs.value = [currentTab.value]
  activeTab.value = currentTab.value.name
  closeContextMenu()
}

const toggleTheme = () => {
  themeStore.toggleTheme()
  isDark.value = themeStore.isDark
}

const handleCommand = (command) => {
  if (command === 'profile') {
    handleMenuSelect('/profile')
  } else if (command === 'logout') {
    sessionStorage.removeItem('token')
    router.push('/login')
  }
}
</script>

<style scoped>
.admin-layout {
  width: 100%;
  transition: all 0.3s;
}

.aside-container {
  background-color: #001529;
  transition: all 0.3s;
}

.aside-container.dark {
  background-color: #1a1a1a;
}

.logo-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px 0;
  border-bottom: 1px solid #1f2d3d;
}

.logo-title {
  color: #fff;
  font-size: 18px;
  margin: 0;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  transition: all 0.3s;
}

.header-container.dark {
  background-color: #1a1a1a;
  border-bottom-color: #303030;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.header-container.dark .header-title {
  color: #fff;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  cursor: pointer;
  color: #303133;
}

.header-container.dark .user-info {
  color: #fff;
}

.tabs-container {
  flex: 1;
  overflow: hidden;
  height: 100%;
}

.tabs-container :deep(.el-tabs) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.tabs-container :deep(.el-tabs__content) {
  flex: 1;
  overflow: auto;
  background-color: #f5f7fa;
}

.tabs-container :deep(.el-tabs__header) {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
}

.tabs-container.dark :deep(.el-tabs__header) {
  background-color: #1a1a1a;
  border-bottom-color: #303030;
}

.tabs-container :deep(.el-tabs__nav-wrap::after) {
  background-color: transparent;
}

.tabs-container :deep(.el-tabs__item) {
  color: #303133;
}

.tabs-container.dark :deep(.el-tabs__item) {
  color: #fff;
}

.tabs-container :deep(.el-tabs__item.is-active) {
  color: #409eff;
}

.tabs-container :deep(.el-tabs__content) {
  flex: 1;
  overflow: auto;
  background-color: #f5f7fa;
}

.tabs-container.dark :deep(.el-tabs__content) {
  background-color: #141414;
}

.tab-content {
  padding: 20px;
  min-height: 100%;
}

.context-menu {
  position: fixed;
  z-index: 1000;
  background-color: #fff;
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.context-menu.dark {
  background-color: #1a1a1a;
  border-color: #303030;
}

.context-menu :deep(.el-dropdown-menu__item) {
  color: #303133;
}

.context-menu.dark :deep(.el-dropdown-menu__item) {
  color: #fff;
}

.context-menu :deep(.el-dropdown-menu__item:hover) {
  background-color: #f5f7fa;
}

.context-menu.dark :deep(.el-dropdown-menu__item:hover) {
  background-color: #303030;
}
</style>

<style>
:root.dark {
  color-scheme: dark;
}
</style>