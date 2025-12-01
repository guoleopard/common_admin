<template>
  <div class="role-container" :class="{ dark: isDark }">
    <el-card>
      <div class="card-header">
        <h2>角色管理</h2>
        <el-button type="primary" @click="openAddDialog">
          <el-icon><Plus /></el-icon>
          新增角色
        </el-button>
      </div>
      <div class="search-bar">
        <el-input
          v-model="searchForm.roleName"
          placeholder="请输入角色名称"
          style="width: 200px; margin-right: 10px"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="search">查询</el-button>
        <el-button @click="reset">重置</el-button>
      </div>
      <el-table
        :data="tableData"
        border
        stripe
        style="width: 100%; margin-top: 20px"
      >
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="roleName" label="角色名称" align="center" />
        <el-table-column prop="roleCode" label="角色编码" align="center" />
        <el-table-column prop="description" label="角色描述" align="center" />
        <el-table-column prop="status" label="状态" align="center">
          <template #default="scope">
            <el-switch v-model="scope.row.status" active-value="1" inactive-value="0" />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" align="center" />
        <el-table-column label="操作" align="center" width="250">
          <template #default="scope">
            <el-button size="small" @click="editRole(scope.row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button size="small" @click="assignMenu(scope.row)">
              <el-icon><Menu /></el-icon>
              分配菜单
            </el-button>
            <el-button size="small" type="danger" @click="deleteRole(scope.row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 添加/编辑角色弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="formData" label-width="100px">
        <el-form-item label="角色名称">
          <el-input v-model="formData.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色编码">
          <el-input v-model="formData.roleCode" placeholder="请输入角色编码" />
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="formData.description" type="textarea" placeholder="请输入角色描述" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="formData.status" active-value="1" inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveRole">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 分配菜单弹窗 -->
    <el-dialog v-model="menuDialogVisible" title="分配菜单" width="600px">
      <el-tree
        ref="menuTree"
        :data="menuData"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="checkedMenuIds"
        props="defaultProps"
      />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="menuDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveMenuAssign">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { useThemeStore } from '../../store/modules/theme'
import { ref, onMounted } from 'vue'
import { Plus, Search, Edit, Delete, Menu } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const themeStore = useThemeStore()
const isDark = ref(themeStore.isDark)

const dialogVisible = ref(false)
const menuDialogVisible = ref(false)
const dialogTitle = ref('新增角色')
const formData = ref({
  roleName: '',
  roleCode: '',
  description: '',
  status: '1'
})

const searchForm = ref({
  roleName: ''
})

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

const tableData = ref([
  {
    id: 1,
    roleName: '管理员',
    roleCode: 'admin',
    description: '系统管理员，拥有所有权限',
    status: '1',
    createTime: '2024-01-01 10:00:00'
  },
  {
    id: 2,
    roleName: '普通用户',
    roleCode: 'user',
    description: '普通业务用户，拥有基础权限',
    status: '1',
    createTime: '2024-01-02 10:00:00'
  },
  {
    id: 3,
    roleName: '访客',
    roleCode: 'guest',
    description: '访客用户，拥有浏览权限',
    status: '1',
    createTime: '2024-01-03 10:00:00'
  }
])

const menuData = ref([
  {
    id: 1,
    label: '系统管理',
    children: [
      { id: 2, label: '用户管理' },
      { id: 3, label: '角色管理' },
      { id: 4, label: '菜单管理' }
    ]
  },
  {
    id: 5,
    label: '首页',
    children: []
  }
])

const defaultProps = {
  children: 'children',
  label: 'label'
}

const checkedMenuIds = ref([1, 2, 3, 4, 5])

const openAddDialog = () => {
  dialogTitle.value = '新增角色'
  formData.value = {
    roleName: '',
    roleCode: '',
    description: '',
    status: '1'
  }
  dialogVisible.value = true
}

const editRole = (row) => {
  dialogTitle.value = '编辑角色'
  formData.value = { ...row }
  dialogVisible.value = true
}

const assignMenu = (row) => {
  menuDialogVisible.value = true
}

const deleteRole = (row) => {
  ElMessage.success('删除成功')
}

const search = () => {
  ElMessage.success('查询成功')
}

const reset = () => {
  searchForm.value = {
    roleName: ''
  }
}

const saveRole = () => {
  ElMessage.success('保存成功')
  dialogVisible.value = false
}

const saveMenuAssign = () => {
  ElMessage.success('菜单分配成功')
  menuDialogVisible.value = false
}

const handleSizeChange = (val) => {
  pageSize.value = val
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}

onMounted(() => {
  isDark.value = themeStore.isDark
})
</script>

<style scoped>
.role-container {
  width: 100%;
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-header h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.role-container.dark .card-header h2 {
  color: #fff;
}

.search-bar {
  display: flex;
  align-items: center;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>