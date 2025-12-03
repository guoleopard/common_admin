<template>
  <div class="dict-management-container">
    <el-card class="page-card">
      <template #header>
        <div class="card-header">
          <span>数据字典管理</span>
          <el-button type="primary" @click="handleAddDict" icon="Plus">
            新增字典项
          </el-button>
        </div>
      </template>

      <!-- 字典项表格 -->
      <el-table :data="dictList" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="字典名称" />
        <el-table-column prop="code" label="字典编码" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="sort" label="排序" width="100" />
        <el-table-column label="操作" width="300" fixed="right">
          <template #default="{ row }">
            <el-button @click="handleEditDict(row)" icon="Edit" size="small"></el-button>
            <el-button @click="handleDictValues(row)" icon="List" size="small"></el-button>
            <el-button @click="handleDeleteDict(row)" icon="Delete" size="small" type="danger"></el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑字典项对话框 -->
    <el-dialog
      v-model="dictDialogVisible"
      :title="dictDialogType === 'add' ? '新增字典项' : '编辑字典项'"
      width="500px"
    >
      <el-form ref="dictFormRef" :model="dictFormData" label-width="100px">
        <el-form-item label="字典名称" prop="name" :rules="[{ required: true, message: '请输入字典名称', trigger: 'blur' }]">
          <el-input v-model="dictFormData.name" placeholder="请输入字典名称" />
        </el-form-item>
        <el-form-item label="字典编码" prop="code" :rules="[{ required: true, message: '请输入字典编码', trigger: 'blur' }]">
          <el-input v-model="dictFormData.code" placeholder="请输入字典编码" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="dictFormData.description" placeholder="请输入描述" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input v-model.number="dictFormData.sort" placeholder="请输入排序" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dictDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmitDict">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 字典值管理对话框 -->
    <el-dialog
      v-model="dictValueDialogVisible"
      title="字典值管理"
      width="800px"
    >
      <div class="dict-value-header">
        <span>{{ currentDict ? currentDict.name + ' - 字典值' : '' }}</span>
        <el-button type="primary" @click="handleAddDictValue" icon="Plus">
          新增字典值
        </el-button>
      </div>

      <!-- 字典值表格 -->
      <el-table :data="currentDictValues" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="label" label="字典标签" />
        <el-table-column prop="value" label="字典值" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="sort" label="排序" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-switch v-model="row.status" active-value="1" inactive-value="0" @change="handleDictValueStatusChange(row)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button @click="handleEditDictValue(row)" icon="Edit" size="small"></el-button>
            <el-button @click="handleDeleteDictValue(row)" icon="Delete" size="small" type="danger"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 新增/编辑字典值对话框 -->
      <el-dialog
        v-model="dictValueEditDialogVisible"
        :title="dictValueEditDialogType === 'add' ? '新增字典值' : '编辑字典值'"
        width="500px"
      >
        <el-form ref="dictValueFormRef" :model="dictValueFormData" label-width="100px">
          <el-form-item label="字典标签" prop="label" :rules="[{ required: true, message: '请输入字典标签', trigger: 'blur' }]">
            <el-input v-model="dictValueFormData.label" placeholder="请输入字典标签" />
          </el-form-item>
          <el-form-item label="字典值" prop="value" :rules="[{ required: true, message: '请输入字典值', trigger: 'blur' }]">
            <el-input v-model="dictValueFormData.value" placeholder="请输入字典值" />
          </el-form-item>
          <el-form-item label="描述" prop="description">
            <el-input v-model="dictValueFormData.description" placeholder="请输入描述" type="textarea" :rows="3" />
          </el-form-item>
          <el-form-item label="排序" prop="sort">
            <el-input v-model.number="dictValueFormData.sort" placeholder="请输入排序" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-switch v-model="dictValueFormData.status" active-value="1" inactive-value="0" />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dictValueEditDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleSubmitDictValue">确定</el-button>
          </span>
        </template>
      </el-dialog>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'

// 字典项列表数据
const dictList = ref([
  { id: 1, name: '用户状态', code: 'user_status', description: '用户账号状态', sort: 1 },
  { id: 2, name: '性别', code: 'gender', description: '用户性别', sort: 2 },
  { id: 3, name: '权限类型', code: 'permission_type', description: '系统权限类型', sort: 3 }
])

// 字典值数据（存储所有字典项的字典值）
const dictValueData = ref({
  1: [
    { id: 1, dictId: 1, label: '正常', value: '1', description: '账号正常使用', sort: 1, status: '1' },
    { id: 2, dictId: 1, label: '禁用', value: '0', description: '账号已禁用', sort: 2, status: '1' },
    { id: 3, dictId: 1, label: '待审核', value: '2', description: '账号待审核', sort: 3, status: '1' }
  ],
  2: [
    { id: 4, dictId: 2, label: '男', value: '1', description: '男性', sort: 1, status: '1' },
    { id: 5, dictId: 2, label: '女', value: '0', description: '女性', sort: 2, status: '1' }
  ],
  3: [
    { id: 6, dictId: 3, label: '菜单权限', value: 'menu', description: '系统菜单权限', sort: 1, status: '1' },
    { id: 7, dictId: 3, label: '按钮权限', value: 'button', description: '系统按钮权限', sort: 2, status: '1' }
  ]
})

// 字典项对话框可见性
const dictDialogVisible = ref(false)
// 字典项对话框类型：add 或 edit
const dictDialogType = ref('add')
// 字典项表单引用
const dictFormRef = ref(null)
// 字典项表单数据
const dictFormData = reactive({
  id: '',
  name: '',
  code: '',
  description: '',
  sort: 0
})

// 字典值对话框可见性
const dictValueDialogVisible = ref(false)
// 当前操作的字典项
const currentDict = ref(null)
// 当前字典项的字典值列表
const currentDictValues = ref([])

// 字典值编辑对话框可见性
const dictValueEditDialogVisible = ref(false)
// 字典值编辑对话框类型：add 或 edit
const dictValueEditDialogType = ref('add')
// 字典值表单引用
const dictValueFormRef = ref(null)
// 字典值表单数据
const dictValueFormData = reactive({
  id: '',
  dictId: '',
  label: '',
  value: '',
  description: '',
  sort: 0,
  status: '1'
})

// 监听当前字典项变化，更新字典值列表
watch(currentDict, (newDict) => {
  if (newDict) {
    currentDictValues.value = dictValueData.value[newDict.id] || []
  }
})

// 处理新增字典项按钮点击
const handleAddDict = () => {
  dictDialogType.value = 'add'
  // 重置表单数据
  Object.assign(dictFormData, {
    id: '',
    name: '',
    code: '',
    description: '',
    sort: 0
  })
  dictDialogVisible.value = true
}

// 处理编辑字典项按钮点击
const handleEditDict = (row) => {
  dictDialogType.value = 'edit'
  // 填充表单数据
  Object.assign(dictFormData, row)
  dictDialogVisible.value = true
}

// 处理字典值管理按钮点击
const handleDictValues = (row) => {
  currentDict.value = row
  dictValueDialogVisible.value = true
}

// 处理删除字典项按钮点击
const handleDeleteDict = (row) => {
  ElMessageBox.confirm(
    `确定要删除字典项 "${row.name}" 吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 这里可以添加实际的删除逻辑
    const index = dictList.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      dictList.value.splice(index, 1)
    }
    
    // 删除对应的字典值数据
    delete dictValueData.value[row.id]
    
    ElMessage.success('删除成功')
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 处理字典项表单提交
const handleSubmitDict = () => {
  dictFormRef.value.validate((valid) => {
    if (valid) {
      if (dictDialogType.value === 'add') {
        // 这里可以添加实际的新增逻辑
        const maxId = Math.max(...dictList.value.map(item => item.id))
        dictFormData.id = maxId + 1
        
        dictList.value.push({ ...dictFormData })
        
        // 初始化字典值数据
        dictValueData.value[dictFormData.id] = []
        
        ElMessage.success('新增成功')
      } else {
        // 这里可以添加实际的编辑逻辑
        const index = dictList.value.findIndex(item => item.id === dictFormData.id)
        if (index !== -1) {
          dictList.value[index] = { ...dictFormData }
        }
        ElMessage.success('编辑成功')
      }
      dictDialogVisible.value = false
    } else {
      return false
    }
  })
}

// 处理新增字典值按钮点击
const handleAddDictValue = () => {
  dictValueEditDialogType.value = 'add'
  // 重置表单数据
  Object.assign(dictValueFormData, {
    id: '',
    dictId: currentDict.value.id,
    label: '',
    value: '',
    description: '',
    sort: 0,
    status: '1'
  })
  dictValueEditDialogVisible.value = true
}

// 处理编辑字典值按钮点击
const handleEditDictValue = (row) => {
  dictValueEditDialogType.value = 'edit'
  // 填充表单数据
  Object.assign(dictValueFormData, row)
  dictValueEditDialogVisible.value = true
}

// 处理字典值状态变化
const handleDictValueStatusChange = (row) => {
  ElMessage.success(`字典值 "${row.label}" 状态已更新为 ${row.status === '1' ? '启用' : '禁用'}`)
}

// 处理删除字典值按钮点击
const handleDeleteDictValue = (row) => {
  ElMessageBox.confirm(
    `确定要删除字典值 "${row.label}" 吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 这里可以添加实际的删除逻辑
    const index = currentDictValues.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      currentDictValues.value.splice(index, 1)
    }
    
    // 更新字典值数据
    dictValueData.value[currentDict.value.id] = currentDictValues.value
    
    ElMessage.success('删除成功')
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 处理字典值表单提交
const handleSubmitDictValue = () => {
  dictValueFormRef.value.validate((valid) => {
    if (valid) {
      if (dictValueEditDialogType.value === 'add') {
        // 这里可以添加实际的新增逻辑
        
        // 找到所有字典值中最大的ID
        let maxId = 0
        Object.values(dictValueData.value).forEach(values => {
          values.forEach(item => {
            if (item.id > maxId) {
              maxId = item.id
            }
          })
        })
        
        dictValueFormData.id = maxId + 1
        
        currentDictValues.value.push({ ...dictValueFormData })
        
        // 更新字典值数据
        dictValueData.value[currentDict.value.id] = currentDictValues.value
        
        ElMessage.success('新增成功')
      } else {
        // 这里可以添加实际的编辑逻辑
        const index = currentDictValues.value.findIndex(item => item.id === dictValueFormData.id)
        if (index !== -1) {
          currentDictValues.value[index] = { ...dictValueFormData }
        }
        
        // 更新字典值数据
        dictValueData.value[currentDict.value.id] = currentDictValues.value
        
        ElMessage.success('编辑成功')
      }
      dictValueEditDialogVisible.value = false
    } else {
      return false
    }
  })
}
</script>

<style scoped>
.dict-management-container {
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

.dict-value-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>