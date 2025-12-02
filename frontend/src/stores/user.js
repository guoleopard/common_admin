import { defineStore } from 'pinia'
import { login as loginApi, logout as logoutApi, getUserInfo } from '@/utils/api'

export const useUserStore = defineStore('user', {
  state: () => ({
    // 用户信息
    userInfo: {},
    // 登录 token
    token: localStorage.getItem('token') || '',
    // 刷新 token
    refreshToken: localStorage.getItem('refreshToken') || '',
    // 登录状态
    isLoggedIn: !!localStorage.getItem('token')
  }),

  getters: {
    // 获取用户 ID
    userId: (state) => state.userInfo.id,
    // 获取用户名
    username: (state) => state.userInfo.username,
    // 获取真实姓名
    realName: (state) => state.userInfo.realName,
    // 获取用户角色
    role: (state) => state.userInfo.role,
    // 获取用户角色名称
    roleName: (state) => state.userInfo.roleName,
    // 获取用户头像
    avatar: (state) => state.userInfo.avatar
  },

  actions: {
    // 设置用户信息
    setUserInfo(userInfo) {
      this.userInfo = userInfo || {}
      // 保存用户信息到本地存储
      localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
    },

    // 设置 token
    setToken(token, refreshToken) {
      this.token = token || ''
      this.refreshToken = refreshToken || ''
      this.isLoggedIn = !!token

      // 保存 token 到本地存储
      if (token) {
        localStorage.setItem('token', token)
        localStorage.setItem('refreshToken', refreshToken || '')
      } else {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
      }
    },

    // 登录
    async login(loginData) {
      try {
        const response = await loginApi(loginData)
        if (response.code === 200) {
          const { token, refreshToken, userInfo } = response.data

          // 设置 token
          this.setToken(token, refreshToken)
          // 设置用户信息
          this.setUserInfo(userInfo)

          return response
        } else {
          throw new Error(response.msg || '登录失败')
        }
      } catch (error) {
        throw error
      }
    },

    // 退出登录
    async logout() {
      try {
        // 调用退出登录接口
        await logoutApi()
      } catch (error) {
        console.error('退出登录失败:', error)
      } finally {
        // 清除用户信息和 token
        this.setUserInfo({})
        this.setToken('', '')
        // 清除本地存储的用户信息
        localStorage.removeItem('userInfo')
      }
    },

    // 获取用户信息
    async getInfo() {
      try {
        const response = await getUserInfo()
        if (response.code === 200) {
          this.setUserInfo(response.data)
          return response.data
        } else {
          throw new Error(response.msg || '获取用户信息失败')
        }
      } catch (error) {
        throw error
      }
    },

    // 从本地存储加载用户信息
    loadUserInfoFromStorage() {
      const userInfoStr = localStorage.getItem('userInfo')
      if (userInfoStr) {
        try {
          const userInfo = JSON.parse(userInfoStr)
          this.setUserInfo(userInfo)
        } catch (error) {
          console.error('解析用户信息失败:', error)
          localStorage.removeItem('userInfo')
        }
      }
    }
  }
})