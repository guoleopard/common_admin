import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/test'
    },
    {
      path: '/test',
      name: 'Test',
      component: {
        template: `
          <div>
            <h2>测试路由</h2>
            <p>路由正常工作！</p>
          </div>
        `
      }
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('../views/dashboard/Dashboard.vue')
    },
    {
      path: '/department',
      name: 'Department',
      component: () => import('../views/department/Department.vue')
    },
    {
      path: '/dict',
      name: 'Dict',
      component: () => import('../views/dict/Dict.vue')
    }
  ]
})

export default router