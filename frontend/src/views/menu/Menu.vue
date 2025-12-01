<template>
  <div class="menu-container">
    <el-card class="page-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="card-title">菜单管理</span>
          <el-button type="primary" @click="openAddDialog" class="add-btn">
            <el-icon><Plus /></el-icon>
            <span>新增菜单</span>
          </el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input
          v-model="searchForm.name"
          placeholder="请输入菜单名称"
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

      <!-- 菜单表格 -->
      <el-table
        v-loading="loading"
        :data="menuList"
        row-key="id"
        border
        stripe
        class="menu-table"
      >
        <el-table-column prop="name" label="菜单名称" align="left" width="200" />
        <el-table-column prop="path" label="路由路径" align="left" width="200" />
        <el-table-column prop="icon" label="菜单图标" align="left" width="120">
          <template #default="{ row }">
            <el-icon :size="20" v-if="row.icon">
              <component :is="row.icon" />
            </el-icon>
          </template>
        </el-table-column>
        <el-table-column prop="component" label="组件路径" align="left" width="250" />
        <el-table-column prop="parentName" label="父菜单" align="left" width="150" />
        <el-table-column prop="sort" label="排序" align="center" width="80" />
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
        <el-table-column label="操作" align="center" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="openEditDialog(row)">
              <el-icon><Edit /></el-icon>
              <span>编辑</span>
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

    <!-- 新增/编辑菜单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增菜单' : '编辑菜单'"
      width="600px"
      @close="closeDialog"
    >
      <el-form
        ref="menuFormRef"
        :model="menuForm"
        :rules="menuRules"
        label-width="100px"
        class="menu-form"
      >
        <el-form-item label="父菜单" prop="parentId">
          <el-select
            v-model="menuForm.parentId"
            placeholder="请选择父菜单"
            clearable
          >
            <el-option label="无父菜单" value="0" />
            <el-option
              v-for="menu in parentMenuList"
              :key="menu.id"
              :label="menu.name"
              :value="menu.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="菜单名称" prop="name">
          <el-input
            v-model="menuForm.name"
            placeholder="请输入菜单名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="路由路径" prop="path">
          <el-input
            v-model="menuForm.path"
            placeholder="请输入路由路径"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="菜单图标" prop="icon">
          <el-input
            v-model="menuForm.icon"
            placeholder="请输入图标名称（如：Menu）"
            maxlength="50"
            show-word-limit
          />
          <el-icon :size="24" v-if="menuForm.icon" style="margin-top: 10px;">
            <component :is="menuForm.icon" />
          </el-icon>
        </el-form-item>

        <el-form-item label="组件路径" prop="component">
          <el-input
            v-model="menuForm.component"
            placeholder="请输入组件路径"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="排序" prop="sort">
          <el-input-number
            v-model="menuForm.sort"
            :min="0"
            :max="999"
            placeholder="请输入排序号"
            class="sort-input"
          />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="menuForm.status"
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
  Check
} from '@element-plus/icons-vue'

// 状态管理
const loading = ref(false)
const dialogVisible = ref(false)
const dialogType = ref('add')
const menuFormRef = ref(null)

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

// 菜单表单
const menuForm = reactive({
  id: '',
  parentId: '0',
  name: '',
  path: '',
  icon: '',
  component: '',
  sort: 0,
  status: '1'
})

// 表单验证规则
const menuRules = {
  name: [
    { required: true, message: '请输入菜单名称', trigger: 'blur' },
    { min: 1, max: 50, message: '菜单名称长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  path: [
    { required: true, message: '请输入路由路径', trigger: 'blur' },
    { min: 1, max: 100, message: '路由路径长度在 1 到 100 个字符', trigger: 'blur' }
  ],
  component: [
    { required: true, message: '请输入组件路径', trigger: 'blur' },
    { min: 1, max: 100, message: '组件路径长度在 1 到 100 个字符', trigger: 'blur' }
  ],
  sort: [
    { required: true, message: '请输入排序号', trigger: 'blur' },
    { type: 'number', min: 0, max: 999, message: '排序号在 0 到 999 之间', trigger: 'blur' }
  ]
}

// 菜单列表数据
const menuList = ref([])

// 父菜单列表（用于选择）
const parentMenuList = computed(() => {
  return menuList.value.filter(menu => menu.id !== menuForm.id)
})

// 模拟数据
const mockMenuData = [
  { id: '1', name: '系统管理', path: '/system', icon: 'Setting', component: 'Layout', parentId: '0', parentName: '无父菜单', sort: 1, status: '1' },
  { id: '2', name: '用户管理', path: '/user', icon: 'User', component: 'views/user/User', parentId: '1', parentName: '系统管理', sort: 1, status: '1' },
  { id: '3', name: '角色管理', path: '/role', icon: 'Users', component: 'views/role/Role', parentId: '1', parentName: '系统管理', sort: 2, status: '1' },
  { id: '4', name: '菜单管理', path: '/menu', icon: 'Menu', component: 'views/menu/Menu', parentId: '1', parentName: '系统管理', sort: 3, status: '1' },
  { id: '5', name: '日志管理', path: '/log', icon: 'Document', component: 'views/log/Log', parentId: '1', parentName: '系统管理', sort: 4, status: '0' }
]

// 获取菜单列表
const getMenuList = () => {
  loading.value = true
  
  // 模拟API请求
  setTimeout(() => {
    let filteredData = [...mockMenuData]
    
    // 搜索过滤
    if (searchForm.name) {
      filteredData = filteredData.filter(menu => 
        menu.name.toLowerCase().includes(searchForm.name.toLowerCase())
      )
    }
    
    // 分页
    const startIndex = (pagination.current - 1) * pagination.size
    const endIndex = startIndex + pagination.size
    
    menuList.value = filteredData.slice(startIndex, endIndex)
    pagination.total = filteredData.length
    
    loading.value = false
  }, 500)
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  getMenuList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.name = ''
  pagination.current = 1
  getMenuList()
}

// 分页大小变化
const handleSizeChange = (size) => {
  pagination.size = size
  pagination.current = 1
  getMenuList()
}

// 分页当前页变化
const handleCurrentChange = (current) => {
  pagination.current = current
  getMenuList()
}

// 打开新增对话框
const openAddDialog = () => {
  dialogType.value = 'add'
  dialogVisible.value = true
  
  // 重置表单
  setTimeout(() => {
    menuFormRef.value?.resetFields()
    Object.assign(menuForm, {
      id: '',
      parentId: '0',
      name: '',
      path: '',
      icon: '',
      component: '',
      sort: 0,
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
    Object.assign(menuForm, {
      id: row.id,
      parentId: row.parentId,
      name: row.name,
      path: row.path,
      icon: row.icon,
      component: row.component,
      sort: row.sort,
      status: row.status
    })
  }, 0)
}

// 关闭对话框
const closeDialog = () => {
  dialogVisible.value = false
  menuFormRef.value?.resetFields()
}

// 提交表单
const submitForm = () => {
  menuFormRef.value?.validate((valid) => {
    if (valid) {
      // 模拟API请求
      setTimeout(() => {
        if (dialogType.value === 'add') {
          // 新增菜单
          const newId = (mockMenuData.length + 1).toString()
          mockMenuData.push({
            ...menuForm,
            id: newId,
            parentName: menuForm.parentId === '0' ? '无父菜单' : 
              mockMenuData.find(menu => menu.id === menuForm.parentId)?.name || ''
          })
          ElMessage.success('菜单新增成功')
        } else {
          // 编辑菜单
          const index = mockMenuData.findIndex(menu => menu.id === menuForm.id)
          if (index !== -1) {
            mockMenuData[index] = {
              ...mockMenuData[index],
              ...menuForm,
              parentName: menuForm.parentId === '0' ? '无父菜单' : 
                mockMenuData.find(menu => menu.id === menuForm.parentId)?.name || ''
            }
            ElMessage.success('菜单编辑成功')
          }
        }
        
        dialogVisible.value = false
        getMenuList()
      }, 500)
    }
  })
}

// 切换菜单状态
const handleStatusChange = (row) => {
  ElMessageBox.confirm(
    `确定要${row.status === '1' ? '禁用' : '启用'}菜单 "${row.name}" 吗？`,
    '确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 模拟API请求
    setTimeout(() => {
      const index = mockMenuData.findIndex(menu => menu.id === row.id)
      if (index !== -1) {
        mockMenuData[index].status = row.status
        ElMessage.success(`菜单${row.status === '1' ? '启用' : '禁用'}成功`)
      }
    }, 300)
  }).catch(() => {
    // 恢复原来的状态
    row.status = row.status === '1' ? '0' : '1'
  })
}

// 删除菜单
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除菜单 "${row.name}" 吗？`,
    '确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'danger'
    }
  ).then(() => {
    // 模拟API请求
    setTimeout(() => {
      const index = mockMenuData.findIndex(menu => menu.id === row.id)
      if (index !== -1) {
        mockMenuData.splice(index, 1)
        ElMessage.success('菜单删除成功')
        getMenuList()
      }
    }, 300)
  }).catch(() => {
    // 用户取消删除
  })
}

// 组件挂载时获取菜单列表
onMounted(() => {
  getMenuList()
})
</script>

<style scoped>
.menu-container {
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

.menu-table {
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

.menu-form {
  padding: 20px 0;
}

.sort-input {
  width: 100%;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
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