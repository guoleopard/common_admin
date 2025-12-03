<template>
  <div class="dict-container">
    <el-card class="page-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="card-title">数据字典管理</span>
          <el-button type="primary" @click="openAddDictDialog" class="add-btn">
            <el-icon><Plus /></el-icon>
            <span>新增字典项</span>
          </el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input
          v-model="searchForm.name"
          placeholder="请输入字典项名称"
          prefix-icon="Search"
          class="search-input"
          @keyup.enter="handleSearch"
        />
        <el-input
          v-model="searchForm.code"
          placeholder="请输入字典项编码"
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

      <!-- 字典树形表格 -->
      <el-table
        v-loading="loading"
        :data="treeDictList"
        row-key="id"
        border
        stripe
        class="dict-table"
        :tree-props="{ children: 'dictValues' }"
        default-expand-all
      >
        <el-table-column prop="code" label="字典编码" align="left" width="150" />
        <el-table-column prop="name" label="字典名称" align="left" width="200" />
        <el-table-column prop="description" label="字典描述" align="left" show-overflow-tooltip />
        <el-table-column 
          label="字典值" 
          align="left" 
          v-if="showDictValueColumn"
        >
          <template #default="{ row }">
            <span v-if="row.type === 'dict'">-</span>
            <span v-else>{{ row.value }}</span>
          </template>
        </el-table-column>
        <el-table-column 
          label="显示标签" 
          align="left" 
          v-if="showDictValueColumn"
        >
          <template #default="{ row }">
            <span v-if="row.type === 'dict'">-</span>
            <span v-else>{{ row.label }}</span>
          </template>
        </el-table-column>
        <el-table-column 
          label="排序" 
          align="center" 
          width="80"
          v-if="showDictValueColumn"
        >
          <template #default="{ row }">
            <span v-if="row.type === 'dict'">-</span>
            <span v-else>{{ row.sort }}</span>
          </template>
        </el-table-column>
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
            <el-button 
              type="success" 
              size="small" 
              @click="openAddValueDialog(row)"
              v-if="row.type === 'dict'"
            >
              <el-icon><Plus /></el-icon>
              <span>新增值</span>
            </el-button>
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
    </el-card>

    <!-- 新增/编辑字典项对话框 -->
    <el-dialog
      v-model="dictDialogVisible"
      :title="dictDialogType === 'add' ? '新增字典项' : '编辑字典项'"
      width="600px"
      @close="closeDictDialog"
    >
      <el-form
        ref="dictFormRef"
        :model="dictForm"
        :rules="dictRules"
        label-width="100px"
        class="dict-form"
      >
        <el-form-item label="字典编码" prop="code">
          <el-input
            v-model="dictForm.code"
            placeholder="请输入字典编码"
            maxlength="50"
            show-word-limit
            :disabled="dictDialogType === 'edit'"
          />
        </el-form-item>

        <el-form-item label="字典名称" prop="name">
          <el-input
            v-model="dictForm.name"
            placeholder="请输入字典名称"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="字典描述" prop="description">
          <el-input
            v-model="dictForm.description"
            placeholder="请输入字典描述"
            maxlength="200"
            show-word-limit
            type="textarea"
            :rows="3"
          />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="dictForm.status"
            active-value="1"
            inactive-value="0"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeDictDialog">取消</el-button>
          <el-button type="primary" @click="submitDictForm">
            <el-icon><Check /></el-icon>
            <span>确定</span>
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 新增/编辑字典值对话框 -->
    <el-dialog
      v-model="valueDialogVisible"
      :title="valueDialogType === 'add' ? '新增字典值' : '编辑字典值'"
      width="500px"
      @close="closeValueDialog"
    >
      <el-form
        ref="valueFormRef"
        :model="valueForm"
        :rules="valueRules"
        label-width="100px"
        class="value-form"
      >
        <el-form-item label="字典值" prop="value">
          <el-input
            v-model="valueForm.value"
            placeholder="请输入字典值"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="显示标签" prop="label">
          <el-input
            v-model="valueForm.label"
            placeholder="请输入显示标签"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="排序" prop="sort">
          <el-input-number
            v-model="valueForm.sort"
            :min="0"
            :max="999"
            placeholder="请输入排序号"
            class="sort-input"
          />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="valueForm.status"
            active-value="1"
            inactive-value="0"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeValueDialog">取消</el-button>
          <el-button type="primary" @click="submitValueForm">
            <el-icon><Check /></el-icon>
            <span>确定</span>
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
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
const dictDialogVisible = ref(false)
const valueDialogVisible = ref(false)
const dictDialogType = ref('add')
const valueDialogType = ref('add')
const dictFormRef = ref(null)
const valueFormRef = ref(null)
const showDictValueColumn = ref(true)

// 当前选中的字典项（用于新增字典值）
const currentDict = ref(null)

// 搜索表单
const searchForm = reactive({
  name: '',
  code: ''
})

// 字典项表单
const dictForm = reactive({
  id: '',
  code: '',
  name: '',
  description: '',
  status: '1',
  type: 'dict'
})

// 字典值表单
const valueForm = reactive({
  id: '',
  dictId: '',
  value: '',
  label: '',
  sort: 0,
  status: '1',
  type: 'value'
})

// 字典项验证规则
const dictRules = {
  code: [
    { required: true, message: '请输入字典编码', trigger: 'blur' },
    { min: 1, max: 50, message: '字典编码长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入字典名称', trigger: 'blur' },
    { min: 1, max: 100, message: '字典名称长度在 1 到 100 个字符', trigger: 'blur' }
  ]
}

// 字典值验证规则
const valueRules = {
  value: [
    { required: true, message: '请输入字典值', trigger: 'blur' },
    { min: 1, max: 50, message: '字典值长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  label: [
    { required: true, message: '请输入显示标签', trigger: 'blur' },
    { min: 1, max: 100, message: '显示标签长度在 1 到 100 个字符', trigger: 'blur' }
  ],
  sort: [
    { required: true, message: '请输入排序号', trigger: 'blur' },
    { type: 'number', min: 0, max: 999, message: '排序号在 0 到 999 之间', trigger: 'blur' }
  ]
}

// 模拟数据
const mockDictData = [
  {
    id: '1', 
    code: 'USER_STATUS', 
    name: '用户状态', 
    description: '用户账号状态管理', 
    status: '1',
    type: 'dict',
    dictValues: [
      { id: '101', dictId: '1', value: '0', label: '禁用', sort: 1, status: '1', type: 'value' },
      { id: '102', dictId: '1', value: '1', label: '启用', sort: 2, status: '1', type: 'value' },
      { id: '103', dictId: '1', value: '2', label: '冻结', sort: 3, status: '1', type: 'value' }
    ]
  },
  {
    id: '2', 
    code: 'SEX_TYPE', 
    name: '性别类型', 
    description: '用户性别选项', 
    status: '1',
    type: 'dict',
    dictValues: [
      { id: '201', dictId: '2', value: '0', label: '男', sort: 1, status: '1', type: 'value' },
      { id: '202', dictId: '2', value: '1', label: '女', sort: 2, status: '1', type: 'value' }
    ]
  },
  {
    id: '3', 
    code: 'ROLE_TYPE', 
    name: '角色类型', 
    description: '系统角色分类', 
    status: '1',
    type: 'dict',
    dictValues: [
      { id: '301', dictId: '3', value: 'admin', label: '管理员', sort: 1, status: '1', type: 'value' },
      { id: '302', dictId: '3', value: 'user', label: '普通用户', sort: 2, status: '1', type: 'value' },
      { id: '303', dictId: '3', value: 'guest', label: '访客', sort: 3, status: '1', type: 'value' }
    ]
  }
]

// 字典列表数据
const treeDictList = ref([])

// 获取字典列表
const getDictList = () => {
  loading.value = true
  
  // 模拟API请求
  setTimeout(() => {
    let filteredData = [...mockDictData]
    
    // 搜索过滤
    if (searchForm.name) {
      filteredData = filteredData.filter(dict => 
        dict.name.toLowerCase().includes(searchForm.name.toLowerCase())
      )
    }
    
    if (searchForm.code) {
      filteredData = filteredData.filter(dict => 
        dict.code.toLowerCase().includes(searchForm.code.toLowerCase())
      )
    }
    
    // 为字典值添加必要字段以便在树形表格中显示
    const treeData = filteredData.map(dict => ({
      ...dict,
      dictValues: dict.dictValues.map(value => ({
        ...value,
        code: '-',
        name: value.label,
        description: `值: ${value.value}`
      }))
    }))
    
    treeDictList.value = treeData
    
    loading.value = false
  }, 500)
}

// 搜索
const handleSearch = () => {
  getDictList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.name = ''
  searchForm.code = ''
  getDictList()
}

// 打开新增字典项对话框
const openAddDictDialog = () => {
  dictDialogType.value = 'add'
  dictDialogVisible.value = true
  
  // 重置表单
  setTimeout(() => {
    dictFormRef.value?.resetFields()
    Object.assign(dictForm, {
      id: '',
      code: '',
      name: '',
      description: '',
      status: '1'
    })
  }, 0)
}

// 打开编辑对话框
const openEditDialog = (row) => {
  if (row.type === 'dict') {
    // 编辑字典项
    dictDialogType.value = 'edit'
    dictDialogVisible.value = true
    
    // 填充表单数据
    setTimeout(() => {
      Object.assign(dictForm, {
        id: row.id,
        code: row.code,
        name: row.name,
        description: row.description,
        status: row.status
      })
    }, 0)
  } else {
    // 编辑字典值
    valueDialogType.value = 'edit'
    valueDialogVisible.value = true
    currentDict.value = mockDictData.find(dict => dict.id === row.dictId)
    
    // 填充表单数据
    setTimeout(() => {
      Object.assign(valueForm, {
        id: row.id,
        dictId: row.dictId,
        value: row.value,
        label: row.label,
        sort: row.sort,
        status: row.status
      })
    }, 0)
  }
}

// 打开新增字典值对话框
const openAddValueDialog = (row) => {
  valueDialogType.value = 'add'
  valueDialogVisible.value = true
  currentDict.value = row
  
  // 重置表单
  setTimeout(() => {
    valueFormRef.value?.resetFields()
    Object.assign(valueForm, {
      id: '',
      dictId: row.id,
      value: '',
      label: '',
      sort: 0,
      status: '1'
    })
  }, 0)
}

// 关闭字典对话框
const closeDictDialog = () => {
  dictDialogVisible.value = false
  dictFormRef.value?.resetFields()
}

// 关闭字典值对话框
const closeValueDialog = () => {
  valueDialogVisible.value = false
  valueFormRef.value?.resetFields()
  currentDict.value = null
}

// 提交字典项表单
const submitDictForm = () => {
  dictFormRef.value?.validate((valid) => {
    if (valid) {
      // 模拟API请求
      setTimeout(() => {
        if (dictDialogType.value === 'add') {
          // 新增字典项
          const newId = (mockDictData.length + 1).toString()
          mockDictData.push({
            ...dictForm,
            id: newId,
            dictValues: []
          })
          ElMessage.success('字典项新增成功')
        } else {
          // 编辑字典项
          const index = mockDictData.findIndex(dict => dict.id === dictForm.id)
          if (index !== -1) {
            mockDictData[index] = {
              ...mockDictData[index],
              ...dictForm,
              dictValues: mockDictData[index].dictValues
            }
            ElMessage.success('字典项编辑成功')
          }
        }
        
        // 关闭对话框并刷新列表
        closeDictDialog()
        getDictList()
      }, 500)
    }
  })
}

// 提交字典值表单
const submitValueForm = () => {
  valueFormRef.value?.validate((valid) => {
    if (valid) {
      // 模拟API请求
      setTimeout(() => {
        const dict = mockDictData.find(d => d.id === valueForm.dictId)
        if (dict) {
          if (valueDialogType.value === 'add') {
            // 新增字典值
            const newId = (Math.max(...dict.dictValues.map(v => parseInt(v.id)), 0) + 1).toString()
            dict.dictValues.push({
              ...valueForm,
              id: newId
            })
            ElMessage.success('字典值新增成功')
          } else {
            // 编辑字典值
            const index = dict.dictValues.findIndex(v => v.id === valueForm.id)
            if (index !== -1) {
              dict.dictValues[index] = {
                ...dict.dictValues[index],
                ...valueForm
              }
              ElMessage.success('字典值编辑成功')
            }
          }
        }
        
        // 关闭对话框并刷新列表
        closeValueDialog()
        getDictList()
      }, 500)
    }
  })
}

// 状态变更
const handleStatusChange = (row) => {
  ElMessageBox.confirm(
    `确定要修改${row.type === 'dict' ? '字典项' : '字典值'}的状态吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 模拟API请求
    setTimeout(() => {
      if (row.type === 'dict') {
        // 字典项状态变更
        const index = mockDictData.findIndex(dict => dict.id === row.id)
        if (index !== -1) {
          mockDictData[index].status = row.status
          ElMessage.success('字典项状态修改成功')
        }
      } else {
        // 字典值状态变更
        const dict = mockDictData.find(d => d.id === row.dictId)
        if (dict) {
          const index = dict.dictValues.findIndex(v => v.id === row.id)
          if (index !== -1) {
            dict.dictValues[index].status = row.status
            ElMessage.success('字典值状态修改成功')
          }
        }
      }
    }, 300)
  }).catch(() => {
    // 取消时恢复原来的状态
    if (row.type === 'dict') {
      const dict = mockDictData.find(d => d.id === row.id)
      if (dict) {
        row.status = dict.status
      }
    } else {
      const dict = mockDictData.find(d => d.id === row.dictId)
      if (dict) {
        const value = dict.dictValues.find(v => v.id === row.id)
        if (value) {
          row.status = value.status
        }
      }
    }
  })
}

// 删除
const handleDelete = (row) => {
  const typeName = row.type === 'dict' ? '字典项' : '字典值'
  
  ElMessageBox.confirm(
    `确定要删除该${typeName}吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 模拟API请求
    setTimeout(() => {
      if (row.type === 'dict') {
        // 删除字典项
        const index = mockDictData.findIndex(dict => dict.id === row.id)
        if (index !== -1) {
          mockDictData.splice(index, 1)
          ElMessage.success('字典项删除成功')
        }
      } else {
        // 删除字典值
        const dict = mockDictData.find(d => d.id === row.dictId)
        if (dict) {
          const index = dict.dictValues.findIndex(v => v.id === row.id)
          if (index !== -1) {
            dict.dictValues.splice(index, 1)
            ElMessage.success('字典值删除成功')
            // 更新treeDictList
            const treeDict = treeDictList.value.find(d => d.id === row.dictId)
            if (treeDict) {
              const valueIndex = treeDict.dictValues.findIndex(v => v.id === row.id)
              if (valueIndex !== -1) {
                treeDict.dictValues.splice(valueIndex, 1)
              }
            }
          }
        }
      }
      getDictList()
    }, 300)
  }).catch(() => {
    // 用户取消删除
  })
}

// 页面加载时获取字典列表
onMounted(() => {
  getDictList()
})
</script>

<style scoped>
.dict-container {
  padding: 20px;
}

.page-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 18px;
  font-weight: bold;
}

.search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.search-input {
  width: 200px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.dict-form .el-form-item,
.value-form .el-form-item {
  margin-bottom: 20px;
}

.sort-input {
  width: 100%;
}
</style>