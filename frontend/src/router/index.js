import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../layout/Layout.vue'
import Login from '../views/login/Login.vue'
import { Menu, User, UserFilled, Histogram, Setting as SettingIcon, Lock, Document, Bell } from '@element-plus/icons-vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 主页面布局
    {
      path: '/',
      component: Layout,
      redirect: '/dashboard',
      meta: {
        requireAuth: true
      },
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('../views/dashboard/Dashboard.vue'),
          meta: {
            title: '仪表板',
            icon: Histogram
          }
        },
        {
          path: 'menu',
          name: 'Menu',
          component: () => import('../views/menu/Menu.vue'),
          meta: {
            title: '菜单管理',
            icon: Menu
          }
        },
        {
          path: 'role',
          name: 'Role',
          component: () => import('../views/role/Role.vue'),
          meta: {
            title: '角色管理',
            icon: User
          }
        },
        {
          path: 'user',
          name: 'User',
          component: () => import('../views/user/User.vue'),
          meta: {
            title: '用户管理',
            icon: UserFilled
          }
        },
        {
          path: 'permission',
          name: 'Permission',
          component: () => import('../views/permission/Permission.vue'),
          meta: {
            title: '权限管理',
            icon: Lock
          }
        },
        {
          path: 'setting',
          name: 'Setting',
          component: () => import('../views/setting/Setting.vue'),
          meta: {
            title: '系统设置',
            icon: SettingIcon
          }
        },
        {
          path: 'document',
          name: 'Document',
          component: () => import('../views/document/Document.vue'),
          meta: {
            title: '文档管理',
            icon: Document
          }
        },
        {
          path: 'notification',
          name: 'Notification',
          component: () => import('../views/notification/Notification.vue'),
          meta: {
            title: '通知管理',
            icon: Bell
          }
        },
        // 个人中心页面
        {
          path: 'profile',
          name: 'Profile',
          component: () => import('../views/profile/Profile.vue'),
          meta: {
            title: '个人中心',
            icon: UserFilled
          }
        }
      ]
    },
    // 登录页面
    {
      path: '/login',
      name: 'Login',
      component: Login,
      meta: {
        title: '系统登录',
        requireAuth: false
      }
    },
    // 404 页面
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('../views/404/404.vue'),
      meta: {
        title: '页面不存在',
        requireAuth: false
      }
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title || '系统管理'
  
  // 访问根路径时自动跳转到登录页
  if (to.path === '/') {
    const token = localStorage.getItem('token')
    if (token) {
      // 有 token，跳转到仪表板
      next({ path: '/dashboard' })
    } else {
      // 没有 token，跳转到登录页
      next({ path: '/login' })
    }
    return
  }
  
  // 检查是否需要登录
  if (to.meta.requireAuth) {
    // 获取本地存储的 token
    const token = localStorage.getItem('token')
    if (token) {
      // 有 token，继续访问
      next()
    } else {
      // 没有 token，跳转到登录页面
      next({ path: '/login', query: { redirect: to.fullPath } })
    }
  } else {
    // 不需要登录且有token时，重定向到仪表板
    const token = localStorage.getItem('token')
    if (token && to.path === '/login') {
      next({ path: '/dashboard' })
    } else {
      next()
    }
  }
})

export default router