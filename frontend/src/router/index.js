import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../layout/Layout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: Layout,
      redirect: '/menu',
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
        }
      ]
    }
  ]
})

export default router