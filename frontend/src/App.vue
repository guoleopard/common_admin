<script setup>
import { useAppStore } from './stores/app'
import './style.css'

// 初始化主题
const appStore = useAppStore()
appStore.applyTheme()
</script>

<template>
  <div id="app" class="app-wrapper">
    <router-view />
  </div>
</template>

<style scoped>
.app-wrapper {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-color: var(--el-bg-color);
  transition: background-color 0.3s ease;
}

/* 主题切换过渡效果 */
* {
  transition: 
    background-color 0.3s ease,
    color 0.3s ease,
    border-color 0.3s ease;
}
</style>