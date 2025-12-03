import { createApp } from 'vue'
import './style.css'
import App from './AppTest.vue'

// Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// Router - 使用测试路由排除问题
import router from './router/testRouter.js'

// Pinia
import { createPinia } from 'pinia'
const pinia = createPinia()

const app = createApp(App)

// Register Element Plus Icons
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(ElementPlus)
app.use(router)
app.use(pinia)

app.mount('#app')