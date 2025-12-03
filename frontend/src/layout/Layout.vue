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
                  :index="generateMenuIndex(route, child)"
                  @click="handleMenuItemClick(generateMenuIndex(route, child), route, child)"
                >
                  <el-icon v-if="child.meta.icon"><component :is="child.meta.icon" /></el-icon>
                  <span>{{ child.meta.title }}</span>
                </el-menu-item>
              </template>
            </el-sub-menu>
            <el-menu-item
              v-else-if="!route.meta.hidden"
              :index="route.path"
              @click="handleMenuItemClick(route.path, route)"
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
            <span class="header-title">{{ currentTab ? currentTab.title : '' }}</span>
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
        <!-- 标签页组件 -->
        <div class="tabs-container" :class="{ dark: isDark }">
          <el-tabs v-model:activeName="activeTabId" type="card" @tab-click="handleTabClick">
            <el-tab-pane
              v-for="tab in tabs" 
              :key="tab.id"
              :name="tab.id"
              :label="tab.title"
            >
              <template #label>
                <span @contextmenu.stop="handleTabContextMenu($event, tab.id)">{{ tab.title }}</span>
                <el-icon class="tab-close" @click.stop="closeTab(tab.id)"><Close /></el-icon>
              </template>
            </el-tab-pane>
          </el-tabs>
          <!-- 标签页右键菜单 -->
          <el-dropdown
            ref="tabContextMenu"
            :show-timeout="0"
            :hide-timeout="0"
            @command="handleTabContextMenuCommand"
            v-if="contextMenuPosition.x > 0 || contextMenuPosition.y > 0"
            style="position: fixed; left: 0; top: 0; pointer-events: none;"
          >
            <div style="width: 1px; height: 1px; display: inline-block;" 
                 :style="{ position: 'fixed', left: contextMenuPosition.x + 'px', top: contextMenuPosition.y + 'px' }">
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="refresh">刷新</el-dropdown-item>
                <el-dropdown-item command="closeOthers">关闭其他</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        <el-main class="main-container" :class="{ dark: isDark }">
          <!-- 动态渲染当前标签页的组件 -->
          <component v-if="currentTab && currentTab.component" :is="currentTab.component" />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useThemeStore } from '../store/modules/theme'
import { Setting, User, OfficeBuilding, List, Close } from '@element-plus/icons-vue'

const router = useRouter()
const themeStore = useThemeStore()
const isCollapse = ref(false)
const isDark = ref(themeStore.isDark)
const menuRoutes = ref([])

// 标签页相关数据
const tabs = ref([])
const activeTabId = ref('')
const tabContextMenu = ref(null)
const contextMenuTabId = ref('')
const contextMenuPosition = ref({ x: 0, y: 0 })

// 计算当前激活的标签页
const currentTab = computed(() => {
  return tabs.value.find(tab => tab.id === activeTabId.value)
})

// 生成唯一ID的函数
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// 生成菜单索引
const generateMenuIndex = (parentRoute, childRoute) => {
  return parentRoute.path === '/' ? `/${childRoute.path}` : `/${parentRoute.path}/${childRoute.path}`
}

onMounted(() => {
  // 获取根路由下的子路由作为菜单数据源
  const rootRoute = router.getRoutes().find(r => r.path === '/')
  if (rootRoute && rootRoute.children) {
    menuRoutes.value = rootRoute.children
  }
})

// 处理菜单项点击事件
const handleMenuItemClick = (index, parentRoute, childRoute = null) => {
  // 确定要打开的路由
  let targetRoute
  if (childRoute) {
    // 子菜单
    const fullPath = generateMenuIndex(parentRoute, childRoute)
    targetRoute = router.getRoutes().find(r => r.path === fullPath)
  } else {
    // 一级菜单
    targetRoute = parentRoute
  }

  if (!targetRoute) return

  // 创建新的标签页
  const newTab = {
    id: generateId(),
    path: targetRoute.path,
    title: targetRoute.meta.title || '未命名',
    component: targetRoute.component
  }

  // 添加到标签页列表
  tabs.value.push(newTab)

  // 激活新的标签页
  activeTabId.value = newTab.id
}

// 点击标签页
const handleTabClick = (tab) => {
  // 激活对应的标签页
  activeTabId.value = tab.name
}

// 关闭标签页
const closeTab = (tabId) => {
  // 找到要关闭的标签页索引
  const index = tabs.value.findIndex(tab => tab.id === tabId)
  if (index === -1) return

  // 移除标签页
  tabs.value.splice(index, 1)

  // 如果关闭的是当前激活的标签页，则激活上一个标签页
  if (activeTabId.value === tabId) {
    const newIndex = index > 0 ? index - 1 : 0
    if (tabs.value.length > 0) {
      activeTabId.value = tabs.value[newIndex].id
    }
  }
}

// 处理标签页右键菜单事件
const handleTabContextMenu = (event, tabId) => {
  event.preventDefault()
  contextMenuTabId.value = tabId
  
  // 记录鼠标点击位置
  contextMenuPosition.value = { x: event.clientX, y: event.clientY }
  
  // 延迟打开右键菜单，确保位置计算完成
  setTimeout(() => {
    tabContextMenu.value.handleOpen(event)
  }, 0)
}

// 处理标签页右键菜单命令
const handleTabContextMenuCommand = (command) => {
  switch (command) {
    case 'refresh':
      // 刷新当前标签页（重新创建组件实例）
      if (currentTab.value) {
        const tabIndex = tabs.value.findIndex(tab => tab.id === currentTab.value.id)
        if (tabIndex !== -1) {
          tabs.value.splice(tabIndex, 1)
          const newTab = {
            id: generateId(),
            path: currentTab.value.path,
            title: currentTab.value.title,
            component: currentTab.value.component
          }
          tabs.value.splice(tabIndex, 0, newTab)
          activeTabId.value = newTab.id
        }
      }
      break
    case 'closeOthers':
      // 关闭其他标签页，只保留当前标签页
      if (currentTab.value) {
        tabs.value = [currentTab.value]
      }
      break
  }
}

const toggleTheme = () => {
  themeStore.toggleTheme()
  isDark.value = themeStore.isDark
}

const handleCommand = (command) => {
  if (command === 'profile') {
    // 打开个人中心标签页
    const profileRoute = router.getRoutes().find(r => r.path === '/profile')
    if (profileRoute) {
      const newTab = {
        id: generateId(),
        path: profileRoute.path,
        title: profileRoute.meta.title || '个人中心',
        component: profileRoute.component
      }
      tabs.value.push(newTab)
      activeTabId.value = newTab.id
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

/* 标签页容器样式 */
.tabs-container {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  transition: all 0.3s;
}

.tabs-container.dark {
  background-color: #1a1a1a;
  border-bottom-color: #303030;
}

/* 标签页样式 */
:deep(.el-tabs__nav-wrap::after) {
  background-color: transparent;
}

:deep(.el-tabs__item) {
  position: relative;
  padding-right: 20px;
  cursor: pointer;
}

:deep(.el-tabs__item.is-active) {
  color: #409eff;
}

:deep(.el-tabs__item:hover) {
  color: #66b1ff;
}

/* 标签关闭图标样式 */
.tab-close {
  position: absolute;
  top: 50%;
  right: 5px;
  transform: translateY(-50%);
  font-size: 12px;
  color: #909399;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.3s;
}

:deep(.el-tabs__item:hover .tab-close) {
  opacity: 1;
}

.tab-close:hover {
  color: #f56c6c;
}

.main-container {
  padding: 20px;
  background-color: #f5f7fa;
  transition: all 0.3s;
  overflow-y: auto;
  height: calc(100% - 100px);
}

.main-container.dark {
  background-color: #141414;
}
</style>

<style>
:root.dark {
  color-scheme: dark;
}
</style>