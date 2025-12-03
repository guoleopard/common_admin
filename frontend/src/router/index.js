import { createRouter, createWebHistory } from 'vue-router'

// 导入布局组件
import Layout from '../layout/Layout.vue'

// 导入页面组件
import Login from '../views/Login.vue'
import Profile from '../views/Profile.vue'

// 导入功能模块组件
import MenuManagement from '../views/system/MenuManagement.vue'
import RoleManagement from '../views/system/RoleManagement.vue'
import UserManagement from '../views/system/UserManagement.vue'
import DeptManagement from '../views/system/DeptManagement.vue'
import DictManagement from '../views/system/DictManagement.vue'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login,
    meta: {
      title: '登录'
    }
  },
  {
    path: '/home',
    name: 'Layout',
    component: Layout,
    redirect: '/home/menu-management',
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
      },
      {
        path: 'dept-management',
        name: 'DeptManagement',
        component: DeptManagement,
        meta: {
          title: '部门管理',
          icon: 'Tree'
        }
      },
      {
        path: 'dict-management',
        name: 'DictManagement',
        component: DictManagement,
        meta: {
          title: '数据字典管理',
          icon: 'Document'
        }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: Profile,
        meta: {
          title: '个人中心',
          icon: 'User'
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