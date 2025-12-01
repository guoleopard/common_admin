<template>
  <div class="user-container">
    <el-card class="page-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="card-title">用户管理</span>
          <el-button type="primary" @click="openAddDialog" class="add-btn">
            <el-icon><Plus /></el-icon>
            <span>新增用户</span>
          </el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input
          v-model="searchForm.username"
          placeholder="请输入用户名"
          prefix-icon="Search"
          class="search-input"
          @keyup.enter="handleSearch"
        />
        <el-input
          v-model="searchForm.nickname"
          placeholder="请输入昵称"
          prefix-icon="User"
          class="search-input"
          @keyup.enter="handleSearch"
        />
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>
          <span>搜索</span>
        </el-button>
        <el-button @click="resetSearch">
          <el-icon><Refresh /></el-icon>
          <span>重置</span>
        </el-button>
      </div>

      <!-- 用户表格 -->
      <el-table
        v-loading="loading"
        :data="userList"
        row-key="id"
        border
        stripe
        class="user-table"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="username" label="用户名" align="left" width="150" />
        <el-table-column prop="nickname" label="昵称" align="left" width="150" />
        <el-table-column prop="email" label="邮箱" align="left" width="200" />
        <el-table-column prop="phone" label="手机号" align="left" width="150" />
        <el-table-column prop="roleNames" label="角色" align="left" width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" align="center" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              active-value="1"
              inactive-value="0"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" align="center" width="180" />
        <el-table-column label="操作" align="center" width="250" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="openEditDialog(row)">
              <el-icon><Edit /></el-icon>
              <span>编辑</span>
            </el-button>
            <el-button type="warning" size="small" @click="openAssignRoleDialog(row)">
              <el-icon><User /></el-icon>
              <span>分配角色</span>
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              <span>删除</span>
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑用户对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增用户' : '编辑用户'"
      width="600px"
      @close="closeDialog"
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userRules"
        label-width="100px"
        class="user-form"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="userForm.username"
            placeholder="请输入用户名"
            maxlength="50"
            show-word-limit
            :disabled="dialogType === 'edit'"
          />
        </el-form-item>

        <el-form-item label="昵称" prop="nickname">
          <el-input
            v-model="userForm.nickname"
            placeholder="请输入昵称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="userForm.email"
            placeholder="请输入邮箱"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="手机号" prop="phone">
          <el-input
            v-model="userForm.phone"
            placeholder="请输入手机号"
            maxlength="11"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="密码" prop="password" v-if="dialogType === 'add'">
          <el-input
            v-model="userForm.password"
            placeholder="请输入密码"
            maxlength="20"
            show-word-limit
            type="password"
          />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword" v-if="dialogType === 'add'">
          <el-input
            v-model="userForm.confirmPassword"
            placeholder="请确认密码"
            maxlength="20"
            show-word-limit
            type="password"
          />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="userForm.status"
            active-value="1"
            inactive-value="0"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeDialog">取消</el-button>
          <el-button type="primary" @click="submitForm">
            <el-icon><Check /></el-icon>
            <span>确定</span>
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog
      v-model="assignRoleDialogVisible"
      title="分配角色"
      width="500px"
      @close="closeAssignRoleDialog"
    >
      <div class="assign-role-dialog">
        <div class="dialog-title">
          <span class="user-name">{{ currentUserName }} - 角色分配</span>
        </div>

        <!-- 角色选择 -->
        <el-select
          v-model="selectedRoles"
          multiple
          placeholder="请选择角色"
          style="width: 100%"
          collapse-tags
          :max-collapse-tags="2"
        >
          <el-option
            v-for="role in roleList"
            :key="role.id"
            :label="role.name"
            :value="role.id"
          />
        </el-select>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeAssignRoleDialog">取消</el-button>
          <el-button type="primary" @click="saveAssignRole">
            <el-icon><Check /></el-icon>
            <span>保存角色</span>
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Search,
  Refresh,
  Edit,
  Delete,
  Check,
  User
} from '@element-plus/icons-vue'

// 状态管理
const loading = ref(false)
const dialogVisible = ref(false)
const dialogType = ref('add')
const userFormRef = ref(null)

const assignRoleDialogVisible = ref(false)
const currentUserName = ref('')
const currentUserId = ref('')
const selectedRoles = ref([])

// 搜索表单
const searchForm = reactive({
  username: '',
  nickname: ''
})

// 分页信息
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 用户表单
const userForm = reactive({
  id: '',
  username: '',
  nickname: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  status: '1'
})

// 表单验证规则
const userRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 50, message: '用户名长度在 3 到 50 个字符', trigger: 'blur' }
  ],
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 1, max: 50, message: '昵称长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: (rule, value, callback) => {
        if (value !== userForm.password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      }, trigger: 'blur' }
  ]
}

// 用户列表数据
const userList = ref([])

// 角色列表数据
const roleList = ref([
  { id: '1', name: '超级管理员' },
  { id: '2', name: '系统管理员' },
  { id: '3', name: '普通用户' },
  { id: '4', name: '访客' }
])

// 用户角色映射
const userRoles = {
  '1': ['1'],
  '2': ['2'],
  '3': ['3'],
  '4': ['3'],
  '5': ['4']
}

// 模拟数据
const mockUserData = [
  { id: '1', username: 'admin', nickname: '超级管理员', email: 'admin@example.com', phone: '13800138000', roleIds: ['1'], roleNames: ['超级管理员'], status: '1', createTime: '2024-01-01 10:00:00' },
  { id: '2', username: 'system', nickname: '系统管理员', email: 'system@example.com', phone: '13800138001', roleIds: ['2'], roleNames: ['系统管理员'], status: '1', createTime: '2024-01-02 10:00:00' },
  { id: '3', username: 'user1', nickname: '普通用户1', email: 'user1@example.com', phone: '13800138002', roleIds: ['3'], roleNames: ['普通用户'], status: '1', createTime: '2024-01-03 10:00:00' },
  { id: '4', username: 'user2', nickname: '普通用户2', email: 'user2@example.com', phone: '13800138003', roleIds: ['3'], roleNames: ['普通用户'], status: '1', createTime: '2024-01-04 10:00:00' },
  { id: '5', username: 'guest1', nickname: '访客1', email: 'guest1@example.com', phone: '13800138004', roleIds: ['4'], roleNames: ['访客'], status: '0', createTime: '2024-01-05 10:00:00' }
]

// 获取用户列表
const getUserList = () => {
  loading.value = true
  
  // 模拟API请求
  setTimeout(() => {
    let filteredData = [...mockUserData]
    
    // 搜索过滤
    if (searchForm.username) {
      filteredData = filteredData.filter(user => 
        user.username.toLowerCase().includes(searchForm.username.toLowerCase())
      )
    }
    if (searchForm.nickname) {
      filteredData = filteredData.filter(user => 
        user.nickname.toLowerCase().includes(searchForm.nickname.toLowerCase())
      )
    }
    
    // 分页
    const startIndex = (pagination.current - 1) * pagination.size
    const endIndex = startIndex + pagination.size
    
    userList.value = filteredData.slice(startIndex, endIndex)
    pagination.total = filteredData.length
    
    loading.value = false
  }, 500)
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  getUserList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.username = ''
  searchForm.nickname = ''
  pagination.current = 1
  getUserList()
}

// 分页大小变化
const handleSizeChange = (size) => {
  pagination.size = size
  pagination.current = 1
  getUserList()
}

// 分页当前页变化
const handleCurrentChange = (current) => {
  pagination.current = current
  getUserList()
}

// 打开新增对话框
const openAddDialog = () => {
  dialogType.value = 'add'
  dialogVisible.value = true
  
  // 重置表单
  setTimeout(() => {
    userFormRef.value?.resetFields()
    Object.assign(userForm, {
      id: '',
      username: '',
      nickname: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      status: '1'
    })
  }, 0)
}

// 打开编辑对话框
const openEditDialog = (row) => {
  dialogType.value = 'edit'
  dialogVisible.value = true
  
  // 填充表单数据
  setTimeout(() => {
    Object.assign(userForm, {
      id: row.id,
      username: row.username,
      nickname: row.nickname,
      email: row.email,
      phone: row.phone,
      password: '',
      confirmPassword: '',
      status: row.status
    })
  }, 0)
}

// 关闭对话框
const closeDialog = () => {
  dialogVisible.value = false
  userFormRef.value?.resetFields()
}

// 提交表单
const submitForm = () => {
  userFormRef.value?.validate((valid) => {
    if (valid) {
      // 模拟API请求
      setTimeout(() => {
        if (dialogType.value === 'add') {
          // 新增用户
          const newId = (mockUserData.length + 1).toString()
          mockUserData.push({
            ...userForm,
            id: newId,
            roleIds: [],
            roleNames: [],
            createTime: new Date().toISOString().slice(0, 19).replace('T', ' ')
          })
          ElMessage.success('用户新增成功')
        } else {
          // 编辑用户
          const index = mockUserData.findIndex(user => user.id === userForm.id)
          if (index !== -1) {
            mockUserData[index] = {
              ...mockUserData[index],
              ...userForm
            }
            ElMessage.success('用户编辑成功')
          }
        }
        
        dialogVisible.value = false
        getUserList()
      }, 500)
    }
  })
}

// 切换用户状态
const handleStatusChange = (row) => {
  ElMessageBox.confirm(
    `确定要${row.status === '1' ? '禁用' : '启用'}用户 "${row.nickname}" 吗？`,
    '确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 模拟API请求
    setTimeout(() => {
      const index = mockUserData.findIndex(user => user.id === row.id)
      if (index !== -1) {
        mockUserData[index].status = row.status
        ElMessage.success(`用户${row.status === '1' ? '启用' : '禁用'}成功`)
      }
    }, 300)
  }).catch(() => {
    // 恢复原来的状态
    row.status = row.status === '1' ? '0' : '1'
  })
}

// 删除用户
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除用户 "${row.nickname}" 吗？`,
    '确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'danger'
    }
  ).then(() => {
    // 模拟API请求
    setTimeout(() => {
      const index = mockUserData.findIndex(user => user.id === row.id)
      if (index !== -1) {
        mockUserData.splice(index, 1)
        ElMessage.success('用户删除成功')
        getUserList()
      }
    }, 300)
  }).catch(() => {
    // 用户取消删除
  })
}

// 打开分配角色对话框
const openAssignRoleDialog = (row) => {
  assignRoleDialogVisible.value = true
  currentUserName.value = row.nickname
  currentUserId.value = row.id
  
  // 选中用户已有的角色
  setTimeout(() => {
    selectedRoles.value = userRoles[row.id] || []
  }, 0)
}

// 关闭分配角色对话框
const closeAssignRoleDialog = () => {
  assignRoleDialogVisible.value = false
  currentUserName.value = ''
  currentUserId.value = ''
  selectedRoles.value = []
}

// 保存角色分配
const saveAssignRole = () => {
  // 模拟API请求
  setTimeout(() => {
    userRoles[currentUserId.value] = selectedRoles.value
    
    // 更新用户列表中的角色信息
    const userIndex = mockUserData.findIndex(user => user.id === currentUserId.value)
    if (userIndex !== -1) {
      const roleNames = selectedRoles.value.map(roleId => {
        const role = roleList.value.find(r => r.id === roleId)
        return role ? role.name : ''
      }).filter(Boolean)
      
      mockUserData[userIndex].roleIds = selectedRoles.value
      mockUserData[userIndex].roleNames = roleNames
    }
    
    ElMessage.success('角色分配成功')
    assignRoleDialogVisible.value = false
    getUserList()
  }, 500)
}

// 组件挂载时获取用户列表
onMounted(() => {
  getUserList()
})
</script>

<style scoped>
.user-container {
  width: 100%;
  height: 100%;
}

.page-card {
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 6px;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding: 16px;
  background-color: var(--el-fill-color-light);
  border-radius: 6px;
}

.search-input {
  width: 250px;
}

.user-table {
  margin-bottom: 20px;
  border-radius: 6px;
  overflow: hidden;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 20px;
}

.user-form {
  padding: 20px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.assign-role-dialog {
  height: 200px;
  display: flex;
  flex-direction: column;
}

.dialog-title {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--el-border-color);
}

.user-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .search-input {
    width: 200px;
  }
}

@media (max-width: 768px) {
  .search-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-input {
    width: 100%;
  }
  
  .pagination-container {
    justify-content: center;
  }
}
</style>