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
          router
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
                  :index="`/${route.path}/${child.path}`"
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
            <span class="header-title">{{ $route.meta.title }}</span>
          </div>
          <div class="header-right">
            <el-button
              :icon="isDark ? 'Sunny' : 'Moon'"
              @click="toggleTheme"
              circle
            />
            <el-dropdown>
              <div class="user-info">
                <el-icon><User /></el-icon>
                <span>管理员</span>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>个人中心</el-dropdown-item>
                  <el-dropdown-item divided>退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>
        <el-main class="main-container" :class="{ dark: isDark }">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useThemeStore } from '../store/modules/theme'
import { Setting, User } from '@element-plus/icons-vue'

const router = useRouter()
const themeStore = useThemeStore()
const isCollapse = ref(false)
const isDark = ref(themeStore.isDark)
const menuRoutes = ref([])

onMounted(() => {
  // 获取根路由下的子路由作为菜单数据源
  const rootRoute = router.getRoutes().find(r => r.path === '/')
  if (rootRoute && rootRoute.children) {
    console.log('Root route children:', rootRoute.children)
    menuRoutes.value = rootRoute.children
  }
})

const toggleTheme = () => {
  themeStore.toggleTheme()
  isDark.value = themeStore.isDark
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

.main-container {
  padding: 20px;
  background-color: #f5f7fa;
  transition: all 0.3s;
  overflow-y: auto;
  height: calc(100% - 60px);
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