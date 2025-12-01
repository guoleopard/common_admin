<template>
  <div class="role-management-container">
    <el-card class="page-card">
      <template #header>
        <div class="card-header">
          <span>角色管理</span>
          <el-button type="primary" @click="handleAdd" icon="Plus">
            新增角色
          </el-button>
        </div>
      </template>

      <!-- 角色表格 -->
      <el-table :data="roleList" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="角色名称" />
        <el-table-column prop="code" label="角色代码" />
        <el-table-column prop="description" label="角色描述" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-switch v-model="row.status" active-value="1" inactive-value="0" @change="handleStatusChange(row)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button @click="handleEdit(row)" icon="Edit" size="small"></el-button>
            <el-button @click="handleAssignMenu(row)" icon="Setting" size="small"></el-button>
            <el-button @click="handleDelete(row)" icon="Delete" size="small" type="danger"></el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑角色对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增角色' : '编辑角色'"
      width="500px"
    >
      <el-form ref="formRef" :model="formData" label-width="100px">
        <el-form-item label="角色名称" prop="name" :rules="[{ required: true, message: '请输入角色名称', trigger: 'blur' }]">
          <el-input v-model="formData.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色代码" prop="code" :rules="[{ required: true, message: '请输入角色代码', trigger: 'blur' }]">
          <el-input v-model="formData.code" placeholder="请输入角色代码" />
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input v-model="formData.description" placeholder="请输入角色描述" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 分配菜单对话框 -->
    <el-dialog
      v-model="assignMenuDialogVisible"
      title="分配菜单"
      width="600px"
    >
      <el-tree
        ref="menuTreeRef"
        :data="menuList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
      ></el-tree>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="assignMenuDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleAssignMenuSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

// 角色列表数据
const roleList = ref([
  { id: 1, name: '超级管理员', code: 'admin', description: '拥有系统所有权限', status: '1' },
  { id: 2, name: '管理员', code: 'manager', description: '拥有系统大部分权限', status: '1' },
  { id: 3, name: '普通用户', code: 'user', description: '拥有系统基本权限', status: '1' }
])

// 菜单列表数据（用于分配菜单）
const menuList = ref([
  { id: 1, name: '系统管理', children: [
    { id: 2, name: '菜单管理' },
    { id: 3, name: '角色管理' },
    { id: 4, name: '用户管理' }
  ] }
])

// 树形结构配置
const treeProps = { 
  label: 'name',
  children: 'children'
}

// 对话框可见性
const dialogVisible = ref(false)
// 对话框类型：add 或 edit
const dialogType = ref('add')
// 表单引用
const formRef = ref(null)
// 表单数据
const formData = reactive({
  id: '',
  name: '',
  code: '',
  description: ''
})

// 分配菜单对话框可见性
const assignMenuDialogVisible = ref(false)
// 菜单树引用
const menuTreeRef = ref(null)
// 当前选中的角色
const currentRole = ref(null)

// 处理新增按钮点击
const handleAdd = () => {
  dialogType.value = 'add'
  // 重置表单数据
  Object.assign(formData, {
    id: '',
    name: '',
    code: '',
    description: ''
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

// 处理分配菜单按钮点击
const handleAssignMenu = (row) => {
  currentRole.value = row
  assignMenuDialogVisible.value = true
  // 这里可以添加实际的获取角色已分配菜单的逻辑
  // 并设置菜单树的默认选中项
}

// 处理删除按钮点击
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除角色 "${row.name}" 吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 这里可以添加实际的删除逻辑
    const index = roleList.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      roleList.value.splice(index, 1)
    }
    ElMessage.success('删除成功')
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 处理状态切换
const handleStatusChange = (row) => {
  const statusText = row.status === '1' ? '启用' : '禁用'
  ElMessage.success(`角色 "${row.name}" 已${statusText}`)
  // 这里可以添加实际的更新角色状态的逻辑
}

// 处理表单提交
const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      if (dialogType.value === 'add') {
        // 这里可以添加实际的新增逻辑
        const maxId = Math.max(...roleList.value.map(item => item.id))
        formData.id = maxId + 1
        formData.status = '1' // 默认启用
        roleList.value.push({ ...formData })
        ElMessage.success('新增成功')
      } else {
        // 这里可以添加实际的编辑逻辑
        const index = roleList.value.findIndex(item => item.id === formData.id)
        if (index !== -1) {
          roleList.value[index] = { ...formData }
        }
        ElMessage.success('编辑成功')
      }
      dialogVisible.value = false
    } else {
      return false
    }
  })
}

// 处理分配菜单提交
const handleAssignMenuSubmit = () => {
  // 获取选中的菜单ID
  const selectedMenuIds = menuTreeRef.value.getCheckedKeys()
  // 这里可以添加实际的分配菜单逻辑
  ElMessage.success(`已为角色 "${currentRole.value.name}" 分配菜单`)
  assignMenuDialogVisible.value = false
}
</script>

<style scoped>
.role-management-container {
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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>