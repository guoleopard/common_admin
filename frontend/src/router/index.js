import { createRouter, createWebHistory } from 'vue-router'

// 导入布局组件
import Layout from '../layout/Layout.vue'

// 导入功能模块组件
import MenuManagement from '../views/system/MenuManagement.vue'
import RoleManagement from '../views/system/RoleManagement.vue'
import UserManagement from '../views/system/UserManagement.vue'

const routes = [
  {
    path: '/',
    name: 'Layout',
    component: Layout,
    redirect: '/menu-management',
    children: [
      {
        path: 'menu-management',
        name: 'MenuManagement',
        component: MenuManagement,
        meta: {
          title: '菜单管理',
          icon: 'Menu'
        }
      },
      {
        path: 'role-management',
        name: 'RoleManagement',
        component: RoleManagement,
        meta: {
          title: '角色管理',
          icon: 'User'
        }
      },
      {
        path: 'user-management',
        name: 'UserManagement',
        component: UserManagement,
        meta: {
          title: '用户管理',
          icon: 'People'
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router