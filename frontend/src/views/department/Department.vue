<template>
  <div class="department-container">
    <el-card class="page-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="card-title">部门管理</span>
          <el-button type="primary" @click="openAddDialog" class="add-btn">
            <el-icon><Plus /></el-icon>
            <span>新增部门</span>
          </el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input
          v-model="searchForm.name"
          placeholder="请输入部门名称"
          prefix-icon="Search"
          class="search-input"
          @keyup.enter="handleSearch"
        />
        <el-input
          v-model="searchForm.code"
          placeholder="请输入部门编码"
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

      <!-- 部门树形表格 -->
      <el-table
        v-loading="loading"
        :data="treeDepartmentList"
        row-key="id"
        border
        stripe
        class="department-table"
        :tree-props="{ children: 'children' }"
        default-expand-all
      >
        <el-table-column prop="code" label="部门编码" align="left" width="150" />
        <el-table-column prop="name" label="部门名称" align="left" width="200" />
        <el-table-column prop="parentName" label="上级部门" align="left" width="150" />
        <el-table-column label="部门路径" align="left" show-overflow-tooltip>
          <template #default="{ row }">
            {{ getDepartmentPath(row.id) }}
          </template>
        </el-table-column>
        <el-table-column prop="description" label="部门描述" align="left" show-overflow-tooltip />
        <el-table-column prop="leader" label="部门负责人" align="left" width="120" />
        <el-table-column prop="phone" label="联系电话" align="left" width="120" />
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

    <!-- 新增/编辑部门对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增部门' : '编辑部门'"
      width="600px"
      @close="closeDialog"
    >
      <el-form
        ref="departmentFormRef"
        :model="departmentForm"
        :rules="departmentRules"
        label-width="100px"
        class="department-form"
      >
        <el-form-item label="上级部门" prop="parentId">
          <el-select
            v-model="departmentForm.parentId"
            placeholder="请选择上级部门"
            clearable
          >
            <el-option label="无上级部门" value="0" />
            <el-option
              v-for="dept in parentDepartmentList"
              :key="dept.id"
              :label="dept.name"
              :value="dept.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="部门编码" prop="code">
          <el-input
            v-model="departmentForm.code"
            placeholder="请输入部门编码"
            maxlength="50"
            show-word-limit
            :disabled="dialogType === 'edit'"
          />
        </el-form-item>

        <el-form-item label="部门名称" prop="name">
          <el-input
            v-model="departmentForm.name"
            placeholder="请输入部门名称"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="部门描述" prop="description">
          <el-input
            v-model="departmentForm.description"
            placeholder="请输入部门描述"
            maxlength="200"
            show-word-limit
            type="textarea"
            :rows="3"
          />
        </el-form-item>

        <el-form-item label="部门负责人" prop="leader">
          <el-input
            v-model="departmentForm.leader"
            placeholder="请输入部门负责人"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="联系电话" prop="phone">
          <el-input
            v-model="departmentForm.phone"
            placeholder="请输入联系电话"
            maxlength="20"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="departmentForm.status"
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
const departmentFormRef = ref(null)

// 搜索表单
const searchForm = reactive({
  name: '',
  code: ''
})

// 分页信息
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 部门表单
const departmentForm = reactive({
  id: '',
  parentId: '0',
  code: '',
  name: '',
  description: '',
  leader: '',
  phone: '',
  status: '1'
})

// 表单验证规则
const departmentRules = {
  code: [
    { required: true, message: '请输入部门编码', trigger: 'blur' },
    { min: 1, max: 50, message: '部门编码长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入部门名称', trigger: 'blur' },
    { min: 1, max: 100, message: '部门名称长度在 1 到 100 个字符', trigger: 'blur' }
  ],
  leader: [
    { min: 0, max: 50, message: '部门负责人长度在 0 到 50 个字符', trigger: 'blur' }
  ],
  phone: [
    { min: 0, max: 20, message: '联系电话长度在 0 到 20 个字符', trigger: 'blur' }
  ]
}

// 部门列表数据
const departmentList = ref([])

// 树形部门列表数据
const treeDepartmentList = ref([])

// 上级部门列表（用于选择）
const parentDepartmentList = computed(() => {
  return departmentList.value.filter(dept => dept.id !== departmentForm.id)
})

// 转换为树形结构
const convertToTree = (data, parentId = '0') => {
  return data
    .filter(item => item.parentId === parentId)
    .map(item => ({
      ...item,
      children: convertToTree(data, item.id)
    }))
}

// 生成部门的完整路径
const getDepartmentPath = (deptId, path = '') => {
  const dept = departmentList.value.find(d => d.id === deptId)
  if (!dept) return path
  const newPath = dept.name + (path ? ' / ' + path : '')
  return dept.parentId === '0' ? newPath : getDepartmentPath(dept.parentId, newPath)
}

// 模拟数据
const mockDepartmentData = [
  { id: '1', code: 'DEPT001', name: '研发部', parentId: '0', parentName: '无上级部门', description: '负责产品研发', leader: '张三', phone: '13800138000', status: '1' },
  { id: '2', code: 'DEPT002', name: '产品部', parentId: '0', parentName: '无上级部门', description: '负责产品规划', leader: '李四', phone: '13800138001', status: '1' },
  { id: '3', code: 'DEPT003', name: '技术部', parentId: '1', parentName: '研发部', description: '负责技术支持', leader: '王五', phone: '13800138002', status: '1' },
  { id: '4', code: 'DEPT004', name: '设计部', parentId: '1', parentName: '研发部', description: '负责UI/UX设计', leader: '赵六', phone: '13800138003', status: '1' },
  { id: '5', code: 'DEPT005', name: '前端组', parentId: '3', parentName: '技术部', description: '负责前端开发', leader: '钱七', phone: '13800138004', status: '1' },
  { id: '6', code: 'DEPT006', name: '后端组', parentId: '3', parentName: '技术部', description: '负责后端开发', leader: '孙八', phone: '13800138005', status: '0' }
]

// 获取部门列表
const getDepartmentList = () => {
  loading.value = true
  
  // 模拟API请求
  setTimeout(() => {
    let filteredData = [...mockDepartmentData]
    
    // 搜索过滤
    if (searchForm.name) {
      filteredData = filteredData.filter(dept => 
        dept.name.toLowerCase().includes(searchForm.name.toLowerCase())
      )
    }
    
    if (searchForm.code) {
      filteredData = filteredData.filter(dept => 
        dept.code.toLowerCase().includes(searchForm.code.toLowerCase())
      )
    }
    
    // 分页
    const startIndex = (pagination.current - 1) * pagination.size
    const endIndex = startIndex + pagination.size
    
    departmentList.value = filteredData.slice(startIndex, endIndex)
    pagination.total = filteredData.length
    
    // 转换为树形结构
    treeDepartmentList.value = convertToTree(filteredData)
    
    loading.value = false
  }, 500)
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  getDepartmentList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.name = ''
  searchForm.code = ''
  pagination.current = 1
  getDepartmentList()
}

// 分页大小变化
const handleSizeChange = (size) => {
  pagination.size = size
  pagination.current = 1
  getDepartmentList()
}

// 分页当前页变化
const handleCurrentChange = (current) => {
  pagination.current = current
  getDepartmentList()
}

// 打开新增对话框
const openAddDialog = () => {
  dialogType.value = 'add'
  dialogVisible.value = true
  
  // 重置表单
  setTimeout(() => {
    departmentFormRef.value?.resetFields()
    Object.assign(departmentForm, {
      id: '',
      parentId: '0',
      code: '',
      name: '',
      description: '',
      leader: '',
      phone: '',
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
    Object.assign(departmentForm, {
      id: row.id,
      parentId: row.parentId,
      code: row.code,
      name: row.name,
      description: row.description,
      leader: row.leader,
      phone: row.phone,
      status: row.status
    })
  }, 0)
}

// 关闭对话框
const closeDialog = () => {
  dialogVisible.value = false
  departmentFormRef.value?.resetFields()
}

// 提交表单
const submitForm = () => {
  departmentFormRef.value?.validate((valid) => {
    if (valid) {
      // 模拟API请求
      setTimeout(() => {
        if (dialogType.value === 'add') {
          // 新增部门
          const newId = (mockDepartmentData.length + 1).toString()
          mockDepartmentData.push({
            ...departmentForm,
            id: newId,
            parentName: departmentForm.parentId === '0' ? '无上级部门' : 
              mockDepartmentData.find(dept => dept.id === departmentForm.parentId)?.name || ''
          })
          ElMessage.success('部门新增成功')
        } else {
          // 编辑部门
          const index = mockDepartmentData.findIndex(dept => dept.id === departmentForm.id)
          if (index !== -1) {
            mockDepartmentData[index] = {
              ...mockDepartmentData[index],
              ...departmentForm,
              parentName: departmentForm.parentId === '0' ? '无上级部门' : 
                mockDepartmentData.find(dept => dept.id === departmentForm.parentId)?.name || ''
            }
            ElMessage.success('部门编辑成功')
          }
        }
        
        // 关闭对话框并刷新列表
        closeDialog()
        getDepartmentList()
      }, 500)
    }
  })
}

// 状态变更
const handleStatusChange = (row) => {
  ElMessageBox.confirm(
    '确定要修改该部门的状态吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 模拟API请求
    setTimeout(() => {
      const index = mockDepartmentData.findIndex(dept => dept.id === row.id)
      if (index !== -1) {
        mockDepartmentData[index].status = row.status
        ElMessage.success('部门状态修改成功')
      }
    }, 300)
  }).catch(() => {
    // 取消时恢复原来的状态
    const index = mockDepartmentData.findIndex(dept => dept.id === row.id)
    if (index !== -1) {
      row.status = mockDepartmentData[index].status
    }
  })
}

// 删除部门
const handleDelete = (row) => {
  // 检查是否有子部门
  const hasChildren = mockDepartmentData.some(dept => dept.parentId === row.id)
  if (hasChildren) {
    ElMessage.warning('该部门下有子部门，无法删除')
    return
  }
  
  ElMessageBox.confirm(
    '确定要删除该部门吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 模拟API请求
    setTimeout(() => {
      const index = mockDepartmentData.findIndex(dept => dept.id === row.id)
      if (index !== -1) {
        mockDepartmentData.splice(index, 1)
        ElMessage.success('部门删除成功')
        getDepartmentList()
      }
    }, 300)
  }).catch(() => {
    // 用户取消删除
  })
}

// 页面加载时获取部门列表
onMounted(() => {
  getDepartmentList()
})
</script>

<style scoped>
.department-container {
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

.department-form .el-form-item {
  margin-bottom: 20px;
}
</style>