import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    // 主题模式：light 或 dark
    theme: 'light',
    // 侧边栏折叠状态
    sidebarCollapse: false
  }),
  actions: {
    // 切换主题
    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light'
      // 保存到本地存储
      localStorage.setItem('theme', this.theme)
      // 应用主题
      this.applyTheme()
    },
    // 应用主题
    applyTheme() {
      if (this.theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    },
    // 初始化主题
    initTheme() {
      // 从本地存储获取主题，如果没有则使用默认值
      const savedTheme = localStorage.getItem('theme')
      if (savedTheme) {
        this.theme = savedTheme
      }
      // 应用主题
      this.applyTheme()
    },
    // 切换侧边栏折叠状态
    toggleSidebar() {
      this.sidebarCollapse = !this.sidebarCollapse
    }
  }
})