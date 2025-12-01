<template>
  <div class="user-management-container">
    <el-card class="page-card">
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <el-button type="primary" @click="handleAdd" icon="Plus">
            新增用户
          </el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input v-model="searchForm.username" placeholder="请输入用户名" style="width: 200px; margin-right: 10px" />
        <el-input v-model="searchForm.email" placeholder="请输入邮箱" style="width: 200px; margin-right: 10px" />
        <el-button @click="handleSearch" icon="Search">搜索</el-button>
        <el-button @click="handleReset" icon="Refresh">重置</el-button>
      </div>

      <!-- 用户表格 -->
      <el-table :data="userList" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="phone" label="手机号" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-switch v-model="row.status" active-value="1" inactive-value="0" @change="handleStatusChange(row)" />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="300" fixed="right">
          <template #default="{ row }">
            <el-button @click="handleEdit(row)" icon="Edit" size="small"></el-button>
            <el-button @click="handleAssignRole(row)" icon="User" size="small"></el-button>
            <el-button @click="handleResetPassword(row)" icon="Key" size="small"></el-button>
            <el-button @click="handleDelete(row)" icon="Delete" size="small" type="danger"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="pagination.currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pagination.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
        ></el-pagination>
      </div>
    </el-card>

    <!-- 新增/编辑用户对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增用户' : '编辑用户'"
      width="600px"
    >
      <el-form ref="formRef" :model="formData" label-width="100px">
        <el-form-item label="用户名" prop="username" :rules="[{ required: true, message: '请输入用户名', trigger: 'blur' }]">
          <el-input v-model="formData.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="姓名" prop="name" :rules="[{ required: true, message: '请输入姓名', trigger: 'blur' }]">
          <el-input v-model="formData.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email" :rules="[
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱格式', trigger: ['blur', 'change'] }
        ]">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item v-if="dialogType === 'add'" label="密码" prop="password" :rules="[{ required: true, message: '请输入密码', trigger: 'blur' }]">
          <el-input v-model="formData.password" placeholder="请输入密码" type="password" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog
      v-model="assignRoleDialogVisible"
      title="分配角色"
      width="500px"
    >
      <el-select v-model="selectedRoleId" placeholder="请选择角色" style="width: 100%">
        <el-option
          v-for="role in roleList"
          :key="role.id"
          :label="role.name"
          :value="role.id"
        ></el-option>
      </el-select>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="assignRoleDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleAssignRoleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

// 用户列表数据
const userList = ref([
  { id: 1, username: 'admin', name: '超级管理员', email: 'admin@example.com', phone: '13800138000', status: '1', createTime: '2023-01-01 00:00:00' },
  { id: 2, username: 'manager', name: '管理员', email: 'manager@example.com', phone: '13800138001', status: '1', createTime: '2023-01-02 00:00:00' },
  { id: 3, username: 'user1', name: '用户1', email: 'user1@example.com', phone: '13800138002', status: '1', createTime: '2023-01-03 00:00:00' },
  { id: 4, username: 'user2', name: '用户2', email: 'user2@example.com', phone: '13800138003', status: '0', createTime: '2023-01-04 00:00:00' }
])

// 角色列表数据（用于分配角色）
const roleList = ref([
  { id: 1, name: '超级管理员' },
  { id: 2, name: '管理员' },
  { id: 3, name: '普通用户' }
])

// 搜索表单
const searchForm = reactive({
  username: '',
  email: ''
})

// 分页信息
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 4
})

// 对话框可见性
const dialogVisible = ref(false)
// 对话框类型：add 或 edit
const dialogType = ref('add')
// 表单引用
const formRef = ref(null)
// 表单数据
const formData = reactive({
  id: '',
  username: '',
  name: '',
  email: '',
  phone: '',
  password: ''
})

// 分配角色对话框可见性
const assignRoleDialogVisible = ref(false)
// 选中的角色ID
const selectedRoleId = ref('')
// 当前选中的用户
const currentUser = ref(null)

// 处理新增按钮点击
const handleAdd = () => {
  dialogType.value = 'add'
  // 重置表单数据
  Object.assign(formData, {
    id: '',
    username: '',
    name: '',
    email: '',
    phone: '',
    password: ''
  })
  dialogVisible.value = true
}

// 处理编辑按钮点击
const handleEdit = (row) => {
  dialogType.value = 'edit'
  // 填充表单数据
  Object.assign(formData, row)
  dialogVisible.value = true
}

// 处理分配角色按钮点击
const handleAssignRole = (row) => {
  currentUser.value = row
  selectedRoleId.value = '' // 重置选中的角色ID
  assignRoleDialogVisible.value = true
  // 这里可以添加实际的获取用户当前角色的逻辑
  // 并设置selectedRoleId的默认值
}

// 处理重置密码按钮点击
const handleResetPassword = (row) => {
  ElMessageBox.confirm(
    `确定要重置用户 "${row.name}" 的密码吗？`,
    '重置密码确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 这里可以添加实际的重置密码逻辑
    ElMessage.success(`用户 "${row.name}" 的密码已重置为默认密码 123456`)
  }).catch(() => {
    ElMessage.info('已取消重置密码')
  })
}

// 处理删除按钮点击
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除用户 "${row.name}" 吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 这里可以添加实际的删除逻辑
    const index = userList.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      userList.value.splice(index, 1)
      pagination.total--
    }
    ElMessage.success('删除成功')
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 处理状态切换
const handleStatusChange = (row) => {
  const statusText = row.status === '1' ? '启用' : '禁用'
  ElMessage.success(`用户 "${row.name}" 已${statusText}`)
  // 这里可以添加实际的更新用户状态的逻辑
}

// 处理搜索
const handleSearch = () => {
  // 这里可以添加实际的搜索逻辑
  ElMessage.info('搜索功能')
}

// 处理重置
const handleReset = () => {
  // 重置搜索表单
  Object.assign(searchForm, {
    username: '',
    email: ''
  })
  // 这里可以添加实际的重置搜索结果的逻辑
  ElMessage.info('搜索条件已重置')
}

// 处理分页大小变化
const handleSizeChange = (size) => {
  pagination.pageSize = size
  // 这里可以添加实际的分页查询逻辑
  ElMessage.info(`每页显示 ${size} 条数据`)
}

// 处理分页当前页变化
const handleCurrentChange = (page) => {
  pagination.currentPage = page
  // 这里可以添加实际的分页查询逻辑
  ElMessage.info(`当前显示第 ${page} 页数据`)
}

// 处理表单提交
const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      if (dialogType.value === 'add') {
        // 这里可以添加实际的新增逻辑
        const maxId = Math.max(...userList.value.map(item => item.id))
        formData.id = maxId + 1
        formData.status = '1' // 默认启用
        formData.createTime = new Date().toLocaleString()
        userList.value.push({ ...formData })
        pagination.total++
        ElMessage.success('新增成功')
      } else {
        // 这里可以添加实际的编辑逻辑
        const index = userList.value.findIndex(item => item.id === formData.id)
        if (index !== -1) {
          userList.value[index] = { ...formData }
        }
        ElMessage.success('编辑成功')
      }
      dialogVisible.value = false
    } else {
      return false
    }
  })
}

// 处理分配角色提交
const handleAssignRoleSubmit = () => {
  if (!selectedRoleId.value) {
    ElMessage.warning('请选择角色')
    return
  }
  // 这里可以添加实际的分配角色逻辑
  const roleName = roleList.value.find(role => role.id === selectedRoleId.value)?.name || ''
  ElMessage.success(`已为用户 "${currentUser.value.name}" 分配角色 "${roleName}"`)
  assignRoleDialogVisible.value = false
}
</script>

<style scoped>
.user-management-container {
  padding: 0;
}

.page-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.search-bar {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>