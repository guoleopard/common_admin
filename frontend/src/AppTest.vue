<template>
  <div id="app" style="width: 100%; height: 100vh;">
    <h1>测试页面</h1>
    <p>如果看到这个内容，说明Vue应用正常工作。</p>
    <p>点击下面的链接测试路由：</p>
    <div>
      <router-link to="/dashboard">仪表板</router-link> |
      <router-link to="/department">部门管理</router-link> |
      <router-link to="/dict">数据字典</router-link>
    </div>
    <div style="margin-top: 20px; padding: 20px; border: 1px solid #ccc;">
      <router-view />
    </div>
  </div>
</template>

<script setup>
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
body {
  font-family: sans-serif;
  padding: 20px;
}
h1 {
  color: #333;
  margin-bottom: 10px;
}
p {
  color: #666;
  margin: 5px 0;
}
router-link {
  color: #409eff;
  text-decoration: none;
  margin: 0 5px;
}
router-link:hover {
  text-decoration: underline;
}
</style>