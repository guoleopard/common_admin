import { defineStore } from 'pinia'
import { themeUtils } from '../utils'

export const useAppStore = defineStore('app', {
  state: () => ({
    theme: themeUtils.initTheme(), // 主题：light/dark，初始化时从本地存储获取
    sidebar: {
      opened: true, // 侧边栏是否展开
      withoutAnimation: false // 是否有动画
    },
    breadcrumb: [] // 面包屑导航
  }),

  getters: {
    // 获取主题
    getTheme: (state) => state.theme,
    // 获取侧边栏状态
    getSidebar: (state) => state.sidebar,
    // 获取面包屑导航
    getBreadcrumb: (state) => state.breadcrumb
  },

  actions: {
    // 切换主题
    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light'
      // 保存主题到本地存储并应用
      themeUtils.saveTheme(this.theme)
      themeUtils.applyTheme(this.theme)
    },

    // 应用主题
    applyTheme() {
      themeUtils.applyTheme(this.theme)
    },

    // 切换侧边栏
    toggleSidebar() {
      this.sidebar.opened = !this.sidebar.opened
      this.sidebar.withoutAnimation = false
    },

    // 关闭侧边栏
    closeSidebar(withoutAnimation) {
      this.sidebar.opened = false
      this.sidebar.withoutAnimation = withoutAnimation
    },

    // 设置面包屑导航
    setBreadcrumb(breadcrumb) {
      this.breadcrumb = breadcrumb
    }
  }
})