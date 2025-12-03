<template>
  <div class="dept-management-container">
    <el-card class="page-card">
      <template #header>
        <div class="card-header">
          <span>部门管理</span>
          <el-button type="primary" @click="handleAdd" icon="Plus">
            新增部门
          </el-button>
        </div>
      </template>

      <!-- 部门表格 -->
      <el-table :data="deptList" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="部门名称" />
        <el-table-column prop="parentName" label="上级部门" />
        <el-table-column prop="manager" label="部门经理" />
        <el-table-column prop="phone" label="联系电话" />
        <el-table-column prop="sort" label="排序" width="100" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button @click="handleEdit(row)" icon="Edit" size="small"></el-button>
            <el-button @click="handleDelete(row)" icon="Delete" size="small" type="danger"></el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑部门对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增部门' : '编辑部门'"
      width="500px"
    >
      <el-form ref="formRef" :model="formData" label-width="100px">
        <el-form-item label="部门名称" prop="name" :rules="[{ required: true, message: '请输入部门名称', trigger: 'blur' }]">
          <el-input v-model="formData.name" placeholder="请输入部门名称" />
        </el-form-item>
        <el-form-item label="上级部门" prop="parentId">
          <el-select v-model.number="formData.parentId" placeholder="请选择上级部门">
            <el-option label="无" value="0" />
            <el-option v-for="dept in deptList" :key="dept.id" :label="dept.name" :value="dept.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="部门经理" prop="manager">
          <el-input v-model="formData.manager" placeholder="请输入部门经理" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入联系电话" />
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

// 部门列表数据
const deptList = ref([
  { id: 1, name: '公司总部', parentId: 0, parentName: '无', manager: '张三', phone: '13800138001', sort: 1 },
  { id: 2, name: '技术部', parentId: 1, parentName: '公司总部', manager: '李四', phone: '13800138002', sort: 2 },
  { id: 3, name: '市场部', parentId: 1, parentName: '公司总部', manager: '王五', phone: '13800138003', sort: 3 },
  { id: 4, name: '开发组', parentId: 2, parentName: '技术部', manager: '赵六', phone: '13800138004', sort: 1 },
  { id: 5, name: '测试组', parentId: 2, parentName: '技术部', manager: '孙七', phone: '13800138005', sort: 2 }
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
  parentId: 0,
  manager: '',
  phone: '',
  sort: 0
})

// 处理新增按钮点击
const handleAdd = () => {
  dialogType.value = 'add'
  // 重置表单数据
  Object.assign(formData, {
    id: '',
    name: '',
    parentId: 0,
    manager: '',
    phone: '',
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
    `确定要删除部门 "${row.name}" 吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 这里可以添加实际的删除逻辑
    const index = deptList.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      deptList.value.splice(index, 1)
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
        const maxId = Math.max(...deptList.value.map(item => item.id))
        formData.id = maxId + 1
        
        // 获取上级部门名称
        const parentDept = deptList.value.find(item => item.id === formData.parentId)
        const parentName = parentDept ? parentDept.name : '无'
        
        deptList.value.push({ ...formData, parentName })
        ElMessage.success('新增成功')
      } else {
        // 这里可以添加实际的编辑逻辑
        const index = deptList.value.findIndex(item => item.id === formData.id)
        if (index !== -1) {
          // 获取上级部门名称
          const parentDept = deptList.value.find(item => item.id === formData.parentId)
          const parentName = parentDept ? parentDept.name : '无'
          
          deptList.value[index] = { ...formData, parentName }
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
.dept-management-container {
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