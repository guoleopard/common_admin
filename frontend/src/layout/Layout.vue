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
          :default-active="$route.path"
          mode="vertical"
          :collapse="isCollapse"
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
                  :index="route.path === '/' ? `/${child.path}` : `/${route.path}/${child.path}`"
                  @click="handleMenuClick(route.path === '/' ? `/${child.path}` : `/${route.path}/${child.path}`, child.meta.title, child.meta.icon)"
                >
                  <el-icon v-if="child.meta.icon"><component :is="child.meta.icon" /></el-icon>
                  <span>{{ child.meta.title }}</span>
                </el-menu-item>
              </template>
            </el-sub-menu>
            <el-menu-item
              v-else-if="!route.meta.hidden"
              :index="route.path"
              @click="handleMenuClick(route.path, route.meta.title, route.meta.icon)"
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
            <span class="header-title">{{ $route.meta.title }}</span>
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
          v-model:active-tab="activeTab"
          type="card"
          class="tabs-container"
          :class="{ dark: isDark }"
          @tab-remove="handleTabRemove"
        >
          <el-tab-pane
            v-for="tab in tabs" 
            :key="tab.path"
            :label="tab.title"
            :name="tab.path"
          >
            <template #label>
              <span 
                class="tab-label"
                @contextmenu.prevent="(e) => handleTabContextMenu(e, tab)"
              >
                <el-icon v-if="tab.icon"><component :is="tab.icon" /></el-icon>
                {{ tab.title }}
              </span>
            </template>
            <router-view :key="tab.path" />
          </el-tab-pane>
        </el-tabs>
      </el-container>
    </el-container>
    
    <!-- 右键菜单 -->
    <el-dropdown-menu 
      v-if="contextMenuVisible" 
      class="context-menu"
      :class="{ dark: isDark }"
      :style="{ left: contextMenuPosition.x + 'px', top: contextMenuPosition.y + 'px' }"
      @hide="contextMenuVisible = false"
    >
      <el-dropdown-item command="refresh" @click="handleRefreshTab">
        <el-icon><Refresh /></el-icon>
        刷新
      </el-dropdown-item>
      <el-dropdown-item command="closeOther" @click="handleCloseOtherTabs">
        <el-icon><Close /></el-icon>
        关闭其他
      </el-dropdown-item>
    </el-dropdown-menu>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useThemeStore } from '../store/modules/theme'
import { Setting, User, OfficeBuilding, List, House, UserFilled, Refresh, Close } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const themeStore = useThemeStore()
const isCollapse = ref(false)
const isDark = ref(themeStore.isDark)
const menuRoutes = ref([])
const tabs = ref([])
const activeTab = ref('')
const contextMenuVisible = ref(false)
const contextMenuPosition = ref({ x: 0, y: 0 })
const currentTab = ref(null)

// 初始化首页标签
onMounted(() => {
  // 获取根路由下的子路由作为菜单数据源
  const rootRoute = router.getRoutes().find(r => r.path === '/')
  if (rootRoute && rootRoute.children) {
    menuRoutes.value = rootRoute.children
  }
  
  // 初始化首页标签
  const homeRoute = router.getRoutes().find(r => r.path === '/home')
  if (homeRoute) {
    // 检查是否已经有首页标签
    const existingHomeTab = tabs.value.find(tab => tab.path === '/home')
    if (!existingHomeTab) {
      tabs.value.push({
        path: homeRoute.path,
        title: homeRoute.meta.title,
        icon: homeRoute.meta.icon
      })
    }
    
    // 检查当前路由是否是首页，如果不是则跳转到首页
    if (router.currentRoute.value.path !== '/home') {
      activeTab.value = homeRoute.path
      router.push('/home')
    } else {
      activeTab.value = '/home'
    }
  }
  
  // 点击其他地方关闭右键菜单
  document.addEventListener('click', () => {
    contextMenuVisible.value = false
  })
})

// 处理菜单点击
const handleMenuClick = (path, title, icon) => {
  // 检查标签是否已存在
  const existingTab = tabs.value.find(tab => tab.path === path)
  if (existingTab) {
    activeTab.value = path
    router.push(path)
  } else {
    // 添加新标签
    tabs.value.push({
      path,
      title,
      icon
    })
    activeTab.value = path
    router.push(path)
  }
}

// 处理标签移除
const handleTabRemove = (path) => {
  const index = tabs.value.findIndex(tab => tab.path === path)
  if (index > -1) {
    tabs.value.splice(index, 1)
    
    // 如果移除的是当前激活的标签，激活第一个标签
    if (activeTab.value === path && tabs.value.length > 0) {
      activeTab.value = tabs.value[0].path
      router.push(tabs.value[0].path)
    } else if (tabs.value.length === 0) {
      // 如果所有标签都被移除，添加首页标签
      const homeRoute = router.getRoutes().find(r => r.path === '/home')
      if (homeRoute) {
        tabs.value.push({
          path: homeRoute.path,
          title: homeRoute.meta.title,
          icon: homeRoute.meta.icon
        })
        activeTab.value = homeRoute.path
        router.push('/home')
      }
    }
  }
}

// 处理标签右键菜单
const handleTabContextMenu = (e, tab) => {
  e.preventDefault()
  contextMenuPosition.value = { x: e.clientX, y: e.clientY }
  currentTab.value = tab
  contextMenuVisible.value = true
}

// 刷新当前标签
const handleRefreshTab = () => {
  if (currentTab.value) {
    activeTab.value = currentTab.value.path
    router.push({ path: currentTab.value.path, query: { t: Date.now() } })
    ElMessage.success('页面已刷新')
  }
}

// 关闭其他标签
const handleCloseOtherTabs = () => {
  if (currentTab.value && tabs.value.length > 1) {
    tabs.value = [currentTab.value]
    activeTab.value = currentTab.value.path
    router.push(currentTab.value.path)
    ElMessage.success('其他标签已关闭')
  }
}

const toggleTheme = () => {
  themeStore.toggleTheme()
  isDark.value = themeStore.isDark
}

const handleCommand = (command) => {
  if (command === 'profile') {
    // 检查个人中心标签是否已存在
    const existingTab = tabs.value.find(tab => tab.path === '/profile')
    if (existingTab) {
      activeTab.value = '/profile'
      router.push('/profile')
    } else {
      // 添加新标签
      tabs.value.push({
        path: '/profile',
        title: '个人中心',
        icon: 'UserFilled'
      })
      activeTab.value = '/profile'
      router.push('/profile')
    }
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
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
  transition: all 0.3s;
}

.tabs-container.dark {
  background-color: #141414;
}

.tabs-container :deep(.el-tabs__header) {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
}

.tabs-container.dark :deep(.el-tabs__header) {
  background-color: #1a1a1a;
  border-bottom-color: #303030;
}

.tabs-container :deep(.el-tabs__content) {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.tabs-container.dark :deep(.el-tabs__content) {
  background-color: #141414;
}

.tabs-container :deep(.el-tab-pane) {
  height: 100%;
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.context-menu {
  position: fixed;
  z-index: 9999;
  min-width: 120px;
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
  padding: 8px 16px;
  cursor: pointer;
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