<template>
  <div class="role-container">
    <el-card class="page-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="card-title">角色管理</span>
          <el-button type="primary" @click="openAddDialog" class="add-btn">
            <el-icon><Plus /></el-icon>
            <span>新增角色</span>
          </el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input
          v-model="searchForm.name"
          placeholder="请输入角色名称"
          prefix-icon="Search"
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

      <!-- 角色表格 -->
      <el-table
        v-loading="loading"
        :data="roleList"
        row-key="id"
        border
        stripe
        class="role-table"
      >
        <el-table-column prop="name" label="角色名称" align="left" width="150" />
        <el-table-column prop="code" label="角色编码" align="left" width="150" />
        <el-table-column prop="description" label="角色描述" align="left" width="300" show-overflow-tooltip />
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
            <el-button type="warning" size="small" @click="openPermissionDialog(row)">
              <el-icon><Lock /></el-icon>
              <span>分配权限</span>
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

    <!-- 新增/编辑角色对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增角色' : '编辑角色'"
      width="500px"
      @close="closeDialog"
    >
      <el-form
        ref="roleFormRef"
        :model="roleForm"
        :rules="roleRules"
        label-width="100px"
        class="role-form"
      >
        <el-form-item label="角色名称" prop="name">
          <el-input
            v-model="roleForm.name"
            placeholder="请输入角色名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="角色编码" prop="code">
          <el-input
            v-model="roleForm.code"
            placeholder="请输入角色编码"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="角色描述" prop="description">
          <el-input
            v-model="roleForm.description"
            placeholder="请输入角色描述"
            maxlength="200"
            show-word-limit
            type="textarea"
            :rows="3"
          />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="roleForm.status"
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

    <!-- 分配权限对话框 -->
    <el-dialog
      v-model="permissionDialogVisible"
      title="分配权限"
      width="600px"
      @close="closePermissionDialog"
    >
      <div class="permission-dialog">
        <div class="dialog-title">
          <span class="role-name">{{ currentRoleName }} - 权限分配</span>
        </div>

        <!-- 权限树 -->
        <el-tree
          ref="permissionTreeRef"
          :data="permissionTree"
          :props="treeProps"
          show-checkbox
          node-key="id"
          default-expand-all
          class="permission-tree"
        />
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closePermissionDialog">取消</el-button>
          <el-button type="primary" @click="savePermission">
            <el-icon><Check /></el-icon>
            <span>保存权限</span>
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
  Lock
} from '@element-plus/icons-vue'

// 状态管理
const loading = ref(false)
const dialogVisible = ref(false)
const dialogType = ref('add')
const roleFormRef = ref(null)

const permissionDialogVisible = ref(false)
const permissionTreeRef = ref(null)
const currentRoleName = ref('')
const currentRoleId = ref('')

// 搜索表单
const searchForm = reactive({
  name: ''
})

// 分页信息
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 角色表单
const roleForm = reactive({
  id: '',
  name: '',
  code: '',
  description: '',
  status: '1'
})

// 表单验证规则
const roleRules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 1, max: 50, message: '角色名称长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入角色编码', trigger: 'blur' },
    { min: 1, max: 50, message: '角色编码长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  description: [
    { max: 200, message: '角色描述长度不能超过 200 个字符', trigger: 'blur' }
  ]
}

// 角色列表数据
const roleList = ref([])

// 权限树数据
const permissionTree = ref([
  {
    id: '1',
    label: '系统管理',
    children: [
      { id: '1-1', label: '用户管理', children: [
        { id: '1-1-1', label: '用户列表' },
        { id: '1-1-2', label: '新增用户' },
        { id: '1-1-3', label: '编辑用户' },
        { id: '1-1-4', label: '删除用户' }
      ]},
      { id: '1-2', label: '角色管理', children: [
        { id: '1-2-1', label: '角色列表' },
        { id: '1-2-2', label: '新增角色' },
        { id: '1-2-3', label: '编辑角色' },
        { id: '1-2-4', label: '删除角色' },
        { id: '1-2-5', label: '分配权限' }
      ]},
      { id: '1-3', label: '菜单管理', children: [
        { id: '1-3-1', label: '菜单列表' },
        { id: '1-3-2', label: '新增菜单' },
        { id: '1-3-3', label: '编辑菜单' },
        { id: '1-3-4', label: '删除菜单' }
      ]}
    ]
  },
  {
    id: '2',
    label: '内容管理',
    children: [
      { id: '2-1', label: '文章管理', children: [
        { id: '2-1-1', label: '文章列表' },
        { id: '2-1-2', label: '新增文章' },
        { id: '2-1-3', label: '编辑文章' },
        { id: '2-1-4', label: '删除文章' }
      ]},
      { id: '2-2', label: '分类管理', children: [
        { id: '2-2-1', label: '分类列表' },
        { id: '2-2-2', label: '新增分类' },
        { id: '2-2-3', label: '编辑分类' },
        { id: '2-2-4', label: '删除分类' }
      ]}
    ]
  }
])

// 权限树配置
const treeProps = {
  children: 'children',
  label: 'label'
}

// 角色权限映射
const rolePermissions = {
  '1': ['1', '1-1', '1-1-1', '1-1-2', '1-1-3', '1-1-4', '1-2', '1-2-1', '1-2-2', '1-2-3', '1-2-4', '1-2-5', '1-3', '1-3-1', '1-3-2', '1-3-3', '1-3-4'],
  '2': ['1', '1-1', '1-1-1', '1-2', '1-2-1', '2', '2-1', '2-1-1', '2-1-2', '2-1-3', '2-1-4', '2-2', '2-2-1'],
  '3': ['1', '1-1', '1-1-1', '2', '2-1', '2-1-1']
}

// 模拟数据
const mockRoleData = [
  { id: '1', name: '超级管理员', code: 'admin', description: '拥有系统所有权限', status: '1', createTime: '2024-01-01 10:00:00' },
  { id: '2', name: '系统管理员', code: 'system', description: '拥有系统管理相关权限', status: '1', createTime: '2024-01-02 10:00:00' },
  { id: '3', name: '普通用户', code: 'user', description: '拥有基础的内容查看权限', status: '1', createTime: '2024-01-03 10:00:00' },
  { id: '4', name: '访客', code: 'guest', description: '仅拥有访客权限', status: '0', createTime: '2024-01-04 10:00:00' }
]

// 获取角色列表
const getRoleList = () => {
  loading.value = true
  
  // 模拟API请求
  setTimeout(() => {
    let filteredData = [...mockRoleData]
    
    // 搜索过滤
    if (searchForm.name) {
      filteredData = filteredData.filter(role => 
        role.name.toLowerCase().includes(searchForm.name.toLowerCase())
      )
    }
    
    // 分页
    const startIndex = (pagination.current - 1) * pagination.size
    const endIndex = startIndex + pagination.size
    
    roleList.value = filteredData.slice(startIndex, endIndex)
    pagination.total = filteredData.length
    
    loading.value = false
  }, 500)
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  getRoleList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.name = ''
  pagination.current = 1
  getRoleList()
}

// 分页大小变化
const handleSizeChange = (size) => {
  pagination.size = size
  pagination.current = 1
  getRoleList()
}

// 分页当前页变化
const handleCurrentChange = (current) => {
  pagination.current = current
  getRoleList()
}

// 打开新增对话框
const openAddDialog = () => {
  dialogType.value = 'add'
  dialogVisible.value = true
  
  // 重置表单
  setTimeout(() => {
    roleFormRef.value?.resetFields()
    Object.assign(roleForm, {
      id: '',
      name: '',
      code: '',
      description: '',
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
    Object.assign(roleForm, {
      id: row.id,
      name: row.name,
      code: row.code,
      description: row.description,
      status: row.status
    })
  }, 0)
}

// 关闭对话框
const closeDialog = () => {
  dialogVisible.value = false
  roleFormRef.value?.resetFields()
}

// 提交表单
const submitForm = () => {
  roleFormRef.value?.validate((valid) => {
    if (valid) {
      // 模拟API请求
      setTimeout(() => {
        if (dialogType.value === 'add') {
          // 新增角色
          const newId = (mockRoleData.length + 1).toString()
          mockRoleData.push({
            ...roleForm,
            id: newId,
            createTime: new Date().toISOString().slice(0, 19).replace('T', ' ')
          })
          ElMessage.success('角色新增成功')
        } else {
          // 编辑角色
          const index = mockRoleData.findIndex(role => role.id === roleForm.id)
          if (index !== -1) {
            mockRoleData[index] = {
              ...mockRoleData[index],
              ...roleForm
            }
            ElMessage.success('角色编辑成功')
          }
        }
        
        dialogVisible.value = false
        getRoleList()
      }, 500)
    }
  })
}

// 切换角色状态
const handleStatusChange = (row) => {
  ElMessageBox.confirm(
    `确定要${row.status === '1' ? '禁用' : '启用'}角色 "${row.name}" 吗？`,
    '确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 模拟API请求
    setTimeout(() => {
      const index = mockRoleData.findIndex(role => role.id === row.id)
      if (index !== -1) {
        mockRoleData[index].status = row.status
        ElMessage.success(`角色${row.status === '1' ? '启用' : '禁用'}成功`)
      }
    }, 300)
  }).catch(() => {
    // 恢复原来的状态
    row.status = row.status === '1' ? '0' : '1'
  })
}

// 删除角色
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除角色 "${row.name}" 吗？`,
    '确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'danger'
    }
  ).then(() => {
    // 模拟API请求
    setTimeout(() => {
      const index = mockRoleData.findIndex(role => role.id === row.id)
      if (index !== -1) {
        mockRoleData.splice(index, 1)
        ElMessage.success('角色删除成功')
        getRoleList()
      }
    }, 300)
  }).catch(() => {
    // 用户取消删除
  })
}

// 打开分配权限对话框
const openPermissionDialog = (row) => {
  permissionDialogVisible.value = true
  currentRoleName.value = row.name
  currentRoleId.value = row.id
  
  // 选中角色已有的权限
  setTimeout(() => {
    const permissions = rolePermissions[row.id] || []
    permissionTreeRef.value?.setCheckedKeys(permissions)
  }, 0)
}

// 关闭分配权限对话框
const closePermissionDialog = () => {
  permissionDialogVisible.value = false
  currentRoleName.value = ''
  currentRoleId.value = ''
}

// 保存权限
const savePermission = () => {
  const checkedKeys = permissionTreeRef.value?.getCheckedKeys() || []
  
  // 模拟API请求
  setTimeout(() => {
    rolePermissions[currentRoleId.value] = checkedKeys
    ElMessage.success('权限分配成功')
    permissionDialogVisible.value = false
  }, 500)
}

// 组件挂载时获取角色列表
onMounted(() => {
  getRoleList()
})
</script>

<style scoped>
.role-container {
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
  width: 300px;
}

.role-table {
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

.role-form {
  padding: 20px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.permission-dialog {
  height: 400px;
  display: flex;
  flex-direction: column;
}

.dialog-title {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--el-border-color);
}

.role-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.permission-tree {
  flex: 1;
  overflow-y: auto;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  padding: 12px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .search-input {
    width: 250px;
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