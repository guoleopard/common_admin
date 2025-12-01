import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// 导入Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// 导入Element Plus图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 导入路由
import router from './router'

// 导入状态管理
import { createPinia } from 'pinia'
const pinia = createPinia()

const app = createApp(App)

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 使用插件
app.use(ElementPlus)
app.use(router)
app.use(pinia)

app.mount('#app')
