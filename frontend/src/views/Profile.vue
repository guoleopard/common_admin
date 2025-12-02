<template>
  <div class="profile-container">
    <div class="profile-header">
      <div class="avatar-wrapper">
        <img :src="userInfo.avatar" :alt="userInfo.name" class="avatar">
        <button class="avatar-edit-btn">更换头像</button>
      </div>
      <div class="user-info">
        <h2 class="user-name">{{ userInfo.name }}</h2>
        <p class="user-role">{{ userInfo.role }}</p>
        <p class="user-desc">{{ userInfo.description }}</p>
      </div>
    </div>
    
    <div class="profile-content">
      <div class="info-section">
        <h3 class="section-title">基本信息</h3>
        <div class="info-list">
          <div class="info-item">
            <label class="info-label">用户名</label>
            <span class="info-value">{{ userInfo.username }}</span>
          </div>
          <div class="info-item">
            <label class="info-label">邮箱</label>
            <span class="info-value">{{ userInfo.email }}</span>
          </div>
          <div class="info-item">
            <label class="info-label">手机号</label>
            <span class="info-value">{{ userInfo.phone }}</span>
          </div>
          <div class="info-item">
            <label class="info-label">部门</label>
            <span class="info-value">{{ userInfo.department }}</span>
          </div>
          <div class="info-item">
            <label class="info-label">入职时间</label>
            <span class="info-value">{{ userInfo.joinDate }}</span>
          </div>
        </div>
      </div>
      
      <div class="settings-section">
        <h3 class="section-title">账户设置</h3>
        <div class="settings-list">
          <button class="setting-item" @click="changePassword">
            <span class="setting-icon">🔒</span>
            <span class="setting-text">修改密码</span>
            <span class="setting-arrow">→</span>
          </button>
          <button class="setting-item" @click="editProfile">
            <span class="setting-icon">✏️</span>
            <span class="setting-text">编辑资料</span>
            <span class="setting-arrow">→</span>
          </button>
          <button class="setting-item" @click="notificationSettings">
            <span class="setting-icon">🔔</span>
            <span class="setting-text">通知设置</span>
            <span class="setting-arrow">→</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 用户信息数据
const userInfo = ref({
  name: '张三',
  username: 'zhangsan',
  role: '系统管理员',
  email: 'zhangsan@example.com',
  phone: '13800138000',
  department: '技术部',
  joinDate: '2020-01-01',
  description: '负责系统的日常维护和管理工作',
  avatar: 'https://via.placeholder.com/150/409eff/ffffff?text=用户头像'
})

// 修改密码
const changePassword = () => {
  // 这里可以添加修改密码的逻辑
  alert('修改密码功能开发中...')
}

// 编辑资料
const editProfile = () => {
  // 这里可以添加编辑资料的逻辑
  alert('编辑资料功能开发中...')
}

// 通知设置
const notificationSettings = () => {
  // 这里可以添加通知设置的逻辑
  alert('通知设置功能开发中...')
}
</script>

<style scoped>
.profile-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.profile-header {
  display: flex;
  gap: 30px;
  padding: 30px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
}

.avatar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #f0f0f0;
}

.avatar-edit-btn {
  padding: 8px 16px;
  background-color: #f0f0f0;
  color: #666;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.avatar-edit-btn:hover {
  background-color: #e0e0e0;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
}

.user-name {
  margin: 0;
  font-size: 28px;
  color: #333;
}

.user-role {
  margin: 0;
  font-size: 16px;
  color: #409eff;
  font-weight: 500;
}

.user-desc {
  margin: 0;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.profile-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.info-section,
.settings-section {
  padding: 30px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.section-title {
  margin: 0 0 20px 0;
  font-size: 20px;
  color: #333;
  border-bottom: 2px solid #409eff;
  padding-bottom: 10px;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.info-label {
  min-width: 80px;
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.info-value {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.settings-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px;
  background-color: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  width: 100%;
  text-align: left;
}

.setting-item:hover {
  background-color: #f0f0f0;
  border-color: #409eff;
}

.setting-icon {
  font-size: 18px;
}

.setting-text {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.setting-arrow {
  font-size: 16px;
  color: #999;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .profile-content {
    grid-template-columns: 1fr;
  }
}
</style>