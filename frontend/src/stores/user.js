import { defineStore } from 'pinia'

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
        // 模拟后端接口调用
        await new Promise(resolve => setTimeout(resolve, 1000))

        // 模拟返回数据
        const response = {
          code: 200,
          data: {
            token: 'mock-token-123456',
            refreshToken: 'mock-refresh-token-123456',
            userInfo: {
              id: 1,
              username: loginData.username,
              realName: loginData.username,
              role: 'admin',
              roleName: '管理员',
              email: `${loginData.username}@example.com`,
              phone: '13800138000',
              gender: '1',
              birthday: '1990-01-01',
              introduction: '这是一个模拟用户',
              avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
            }
          }
        }

        const { token, refreshToken, userInfo } = response.data

        // 设置 token
        this.setToken(token, refreshToken)
        // 设置用户信息
        this.setUserInfo(userInfo)

        return response
      } catch (error) {
        throw error
      }
    },

    // 退出登录
    async logout() {
      try {
        // 模拟后端接口调用
        await new Promise(resolve => setTimeout(resolve, 1000))
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
        // 模拟后端接口调用
        await new Promise(resolve => setTimeout(resolve, 1000))

        // 模拟返回数据
        const response = {
          code: 200,
          data: {
            id: 1,
            username: this.userInfo.username || 'admin',
            realName: this.userInfo.realName || '管理员',
            role: 'admin',
            roleName: '管理员',
            email: this.userInfo.email || 'admin@example.com',
            phone: this.userInfo.phone || '13800138000',
            gender: this.userInfo.gender || '1',
            birthday: this.userInfo.birthday || '1990-01-01',
            introduction: this.userInfo.introduction || '这是一个模拟用户',
            avatar: this.userInfo.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
          }
        }

        this.setUserInfo(response.data)
        return response.data
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