<template>
  <div class="menu-management-container">
    <el-card class="page-card">
      <template #header>
        <div class="card-header">
          <span>菜单管理</span>
          <el-button type="primary" @click="handleAdd" icon="Plus">
            新增菜单
          </el-button>
        </div>
      </template>

      <!-- 菜单表格 -->
      <el-table :data="menuList" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="菜单名称" />
        <el-table-column prop="path" label="路由路径" />
        <el-table-column prop="icon" label="图标" />
        <el-table-column prop="parentId" label="父级ID" width="100" />
        <el-table-column prop="sort" label="排序" width="100" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button @click="handleEdit(row)" icon="Edit" size="small"></el-button>
            <el-button @click="handleDelete(row)" icon="Delete" size="small" type="danger"></el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑菜单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增菜单' : '编辑菜单'"
      width="500px"
    >
      <el-form ref="formRef" :model="formData" label-width="100px">
        <el-form-item label="菜单名称" prop="name" :rules="[{ required: true, message: '请输入菜单名称', trigger: 'blur' }]">
          <el-input v-model="formData.name" placeholder="请输入菜单名称" />
        </el-form-item>
        <el-form-item label="路由路径" prop="path">
          <el-input v-model="formData.path" placeholder="请输入路由路径" />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-input v-model="formData.icon" placeholder="请输入图标名称" />
        </el-form-item>
        <el-form-item label="父级ID" prop="parentId">
          <el-input v-model.number="formData.parentId" placeholder="请输入父级ID" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input v-model.number="formData.sort" placeholder="请输入排序" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

// 菜单列表数据
const menuList = ref([
  { id: 1, name: '系统管理', path: '/system', icon: 'Setting', parentId: 0, sort: 1 },
  { id: 2, name: '菜单管理', path: '/menu-management', icon: 'Menu', parentId: 1, sort: 1 },
  { id: 3, name: '角色管理', path: '/role-management', icon: 'User', parentId: 1, sort: 2 },
  { id: 4, name: '用户管理', path: '/user-management', icon: 'People', parentId: 1, sort: 3 }
])

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
  path: '',
  icon: '',
  parentId: 0,
  sort: 0
})

// 处理新增按钮点击
const handleAdd = () => {
  dialogType.value = 'add'
  // 重置表单数据
  Object.assign(formData, {
    id: '',
    name: '',
    path: '',
    icon: '',
    parentId: 0,
    sort: 0
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

// 处理删除按钮点击
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除菜单 "${row.name}" 吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 这里可以添加实际的删除逻辑
    const index = menuList.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      menuList.value.splice(index, 1)
    }
    ElMessage.success('删除成功')
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 处理表单提交
const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      if (dialogType.value === 'add') {
        // 这里可以添加实际的新增逻辑
        const maxId = Math.max(...menuList.value.map(item => item.id))
        formData.id = maxId + 1
        menuList.value.push({ ...formData })
        ElMessage.success('新增成功')
      } else {
        // 这里可以添加实际的编辑逻辑
        const index = menuList.value.findIndex(item => item.id === formData.id)
        if (index !== -1) {
          menuList.value[index] = { ...formData }
        }
        ElMessage.success('编辑成功')
      }
      dialogVisible.value = false
    } else {
      return false
    }
  })
}
</script>

<style scoped>
.menu-management-container {
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