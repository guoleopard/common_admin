import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
import Layout from '../layout/Layout.vue'
import Home from '../views/Home.vue'
import UserManage from '../views/UserManage.vue'
import RoleManage from '../views/RoleManage.vue'
import MenuManage from '../views/MenuManage.vue'
import DeptManage from '../views/DeptManage.vue'
import DictManage from '../views/DictManage.vue'
import TenantManage from '../views/TenantManage.vue'
import Login from '../views/Login.vue'
import Profile from '../views/Profile.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { title: '登录' }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: 'Home',
        component: Home,
        meta: { title: '首页', icon: 'House', requireAuth: true }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: Profile,
        meta: { title: '个人中心', icon: 'UserFilled', requireAuth: true }
      },
      {
        path: 'system',
        name: 'System',
        meta: { title: '系统管理', icon: 'Setting', requireAuth: true },
        children: [
          {
            path: 'user',
            name: 'UserManage',
            component: UserManage,
            meta: { title: '用户管理', icon: 'User', requireAuth: true }
          },
          {
            path: 'role',
            name: 'RoleManage',
            component: RoleManage,
            meta: { title: '角色管理', icon: 'UserFilled', requireAuth: true }
          },
          {
            path: 'menu',
            name: 'MenuManage',
            component: MenuManage,
            meta: { title: '菜单管理', icon: 'Menu', requireAuth: true }
          },
          {
            path: 'dept',
            name: 'DeptManage',
            component: DeptManage,
            meta: { title: '部门管理', icon: 'OfficeBuilding', requireAuth: true }
          },
          {
            path: 'dict',
            name: 'DictManage',
            component: DictManage,
            meta: { title: '数据字典', icon: 'List', requireAuth: true }
          },
          {
            path: 'tenant',
            name: 'TenantManage',
            component: TenantManage,
            meta: { title: '租户管理', icon: 'UserFilled', requireAuth: true }
          }
        ]
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 全局路由守卫
router.beforeEach((to, from, next) => {
  const token = sessionStorage.getItem('token')
  // 需要登录认证的路由
  if (to.meta.requireAuth && !token) {
    ElMessage.warning('请先登录')
    next('/login')
  } else if (to.path === '/login' && token) {
    // 已登录用户访问登录页面，跳转到首页
    next('/home')
  } else {
    next()
  }
})

export default router