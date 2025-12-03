import { createApp, h } from 'vue'

const App = {
  render() {
    return h('div', { style: { padding: '20px' } }, [
      h('h1', 'Vue 应用已启动！'),
      h('p', '如果看到这个内容，说明Vue核心功能正常。'),
      h('p', { style: { color: '#666' } }, '时间：' + new Date().toLocaleString())
    ])
  }
}

const app = createApp(App)
app.mount('#app')