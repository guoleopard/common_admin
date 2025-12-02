import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

// 创建 axios 实例
const service = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API || '/api',
  timeout: 10000
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 获取用户 store
    const userStore = useUserStore()
    // 如果有 token，添加到请求头
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    return config
  },
  (error) => {
    // 处理请求错误
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    // 获取响应数据
    const { data } = response

    // 如果响应码不是 200，处理错误
    if (data.code !== 200) {
      // 显示错误信息
      ElMessage.error(data.msg || '请求失败')
      // 如果是 401 错误，跳转到登录页面
      if (data.code === 401) {
        const userStore = useUserStore()
        userStore.logout()
        // 跳转到登录页面
        window.location.href = '/login'
      }
      return Promise.reject(new Error(data.msg || '请求失败'))
    }

    return data
  },
  (error) => {
    // 处理响应错误
    console.error('响应错误:', error)

    // 根据错误状态码显示不同的错误信息
    if (error.response) {
      const { status, data } = error.response
      switch (status) {
        case 400:
          ElMessage.error(data.msg || '请求参数错误')
          break
        case 401:
          ElMessage.error('未授权，请重新登录')
          // 清除用户信息并跳转到登录页面
          const userStore = useUserStore()
          userStore.logout()
          window.location.href = '/login'
          break
        case 403:
          ElMessage.error('禁止访问')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        case 502:
          ElMessage.error('网关错误')
          break
        case 503:
          ElMessage.error('服务不可用')
          break
        case 504:
          ElMessage.error('网关超时')
          break
        default:
          ElMessage.error(data.msg || `请求失败，状态码: ${status}`)
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      ElMessage.error('请求超时，请稍后重试')
    } else {
      // 请求配置错误
      ElMessage.error(`请求错误: ${error.message}`)
    }

    return Promise.reject(error)
  }
)

// 登录接口
export const login = (data) => {
  return service.post('/auth/login', data)
}

// 退出登录接口
export const logout = () => {
  return service.post('/auth/logout')
}

// 获取用户信息接口
export const getUserInfo = () => {
  return service.get('/auth/info')
}

// 获取图形验证码接口
export const getCaptcha = () => {
  return service.get('/auth/captcha', { responseType: 'blob' })
}

// 更新用户信息接口
export const updateUserInfo = (data) => {
  return service.put('/user/info', data)
}

// 更新密码接口
export const updatePassword = (data) => {
  return service.put('/user/password', data)
}

// 上传用户头像接口
export const uploadUserAvatar = (data) => {
  return service.post('/user/avatar', data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 菜单管理接口
export const getMenuList = (params) => {
  return service.get('/menu/list', { params })
}

export const createMenu = (data) => {
  return service.post('/menu/create', data)
}

export const updateMenu = (id, data) => {
  return service.put(`/menu/update/${id}`, data)
}

export const deleteMenu = (id) => {
  return service.delete(`/menu/delete/${id}`)
}

export const getMenuOptions = () => {
  return service.get('/menu/options')
}

// 角色管理接口
export const getRoleList = (params) => {
  return service.get('/role/list', { params })
}

export const createRole = (data) => {
  return service.post('/role/create', data)
}

export const updateRole = (id, data) => {
  return service.put(`/role/update/${id}`, data)
}

export const deleteRole = (id) => {
  return service.delete(`/role/delete/${id}`)
}

export const getRolePermissions = (id) => {
  return service.get(`/role/permissions/${id}`)
}

export const updateRolePermissions = (id, data) => {
  return service.put(`/role/permissions/${id}`, data)
}

// 用户管理接口
export const getUserList = (params) => {
  return service.get('/user/list', { params })
}

export const createUser = (data) => {
  return service.post('/user/create', data)
}

export const updateUser = (id, data) => {
  return service.put(`/user/update/${id}`, data)
}

export const deleteUser = (id) => {
  return service.delete(`/user/delete/${id}`)
}

export const changeUserStatus = (id, status) => {
  return service.put(`/user/status/${id}`, { status })
}

// 导出所有接口
export default service