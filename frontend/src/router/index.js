import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../layout/Layout.vue'
import Login from '../views/login/Login.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
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
    // 主页面布局
    {
      path: '/',
      component: Layout,
      redirect: '/menu',
      meta: {
        requireAuth: true
      },
      children: [
        {
          path: 'menu',
          name: 'Menu',
          component: () => import('../views/menu/Menu.vue'),
          meta: {
            title: '菜单管理',
            icon: 'Menu'
          }
        },
        {
          path: 'role',
          name: 'Role',
          component: () => import('../views/role/Role.vue'),
          meta: {
            title: '角色管理',
            icon: 'User'
          }
        },
        {
          path: 'user',
          name: 'User',
          component: () => import('../views/user/User.vue'),
          meta: {
            title: '用户管理',
            icon: 'Users'
          }
        },
        // 个人中心页面
        {
          path: 'profile',
          name: 'Profile',
          component: () => import('../views/profile/Profile.vue'),
          meta: {
            title: '个人中心',
            icon: 'UserFilled'
          }
        }
      ]
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
    // 不需要登录，直接访问
    next()
  }
})

export default router