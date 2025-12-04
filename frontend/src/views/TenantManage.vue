<template>
  <div class="tenant-manage">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>租户管理</span>
          <el-button type="primary" @click="openAddDialog">
            <el-icon><Plus /></el-icon>
            添加租户
          </el-button>
        </div>
      </template>
      
      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input
          v-model="searchForm.name"
          placeholder="请输入租户名称"
          style="width: 200px"
          clearable
        >
          <template #append>
            <el-button @click="handleSearch">
              <el-icon><Search /></el-icon>
            </el-button>
          </template>
        </el-input>
        
        <el-select
          v-model="searchForm.status"
          placeholder="请选择状态"
          style="width: 150px"
          clearable
        >
          <el-option label="启用" value="1" />
          <el-option label="禁用" value="0" />
        </el-select>
      </div>
      
      <!-- 租户列表 -->
      <el-table
        v-loading="loading"
        :data="tenantList"
        style="width: 100%"
        border
      >
        <el-table-column
          type="index"
          label="序号"
          width="80"
          align="center"
        />
        <el-table-column
          prop="name"
          label="租户名称"
          width="200"
        />
        <el-table-column
          prop="code"
          label="租户编码"
          width="150"
        />
        <el-table-column
          prop="contact"
          label="联系人"
          width="150"
        />
        <el-table-column
          prop="phone"
          label="联系电话"
          width="150"
        />
        <el-table-column
          prop="email"
          label="邮箱"
          width="200"
        />
        <el-table-column
          prop="status"
          label="状态"
          width="100"
          align="center"
        >
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              active-value="1"
              inactive-value="0"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column
          prop="createTime"
          label="创建时间"
          width="180"
        />
        <el-table-column
          label="操作"
          width="200"
          align="center"
        >
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              @click="openEditDialog(scope.row)"
            >
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="handleDelete(scope.row)"
            >
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handlePageChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
    
    <!-- 添加/编辑租户对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加租户' : '编辑租户'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="tenantFormRef"
        :model="tenantForm"
        label-width="120px"
        :rules="formRules"
      >
        <el-form-item label="租户名称" prop="name">
          <el-input v-model="tenantForm.name" placeholder="请输入租户名称" />
        </el-form-item>
        <el-form-item label="租户编码" prop="code">
          <el-input v-model="tenantForm.code" placeholder="请输入租户编码" />
        </el-form-item>
        <el-form-item label="联系人" prop="contact">
          <el-input v-model="tenantForm.contact" placeholder="请输入联系人" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="tenantForm.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="tenantForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="tenantForm.remark" placeholder="请输入备注" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Edit, Delete } from '@element-plus/icons-vue'

// 状态管理
const loading = ref(false)
const dialogVisible = ref(false)
const dialogType = ref('add')
const tenantFormRef = ref(null)

// 搜索表单
const searchForm = reactive({
  name: '',
  status: ''
})

// 分页
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 租户列表
const tenantList = ref([])

// 租户表单
const tenantForm = reactive({
  id: '',
  name: '',
  code: '',
  contact: '',
  phone: '',
  email: '',
  remark: '',
  status: '1'
})

// 表单验证规则
const formRules = reactive({
  name: [
    { required: true, message: '请输入租户名称', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入租户编码', trigger: 'blur' }
  ],
  contact: [
    { required: true, message: '请输入联系人', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
})

// 页面加载时获取租户列表
onMounted(() => {
  fetchTenantList()
})

// 获取租户列表
const fetchTenantList = async () => {
  loading.value = true
  try {
    // 这里应该调用后端API获取数据
    // 暂时使用模拟数据
    await new Promise(resolve => setTimeout(resolve, 500))
    
    tenantList.value = [
      {
        id: '1',
        name: '租户A',
        code: 'TENANT_A',
        contact: '张三',
        phone: '13800138001',
        email: 'zhangsan@tenant-a.com',
        remark: '这是租户A的备注信息',
        status: '1',
        createTime: '2023-01-01 12:00:00'
      },
      {
        id: '2',
        name: '租户B',
        code: 'TENANT_B',
        contact: '李四',
        phone: '13800138002',
        email: 'lisi@tenant-b.com',
        remark: '这是租户B的备注信息',
        status: '1',
        createTime: '2023-01-02 12:00:00'
      },
      {
        id: '3',
        name: '租户C',
        code: 'TENANT_C',
        contact: '王五',
        phone: '13800138003',
        email: 'wangwu@tenant-c.com',
        remark: '这是租户C的备注信息',
        status: '0',
        createTime: '2023-01-03 12:00:00'
      }
    ]
    
    pagination.total = tenantList.value.length
  } catch (error) {
    ElMessage.error('获取租户列表失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  fetchTenantList()
}

// 分页变更
const handlePageChange = () => {
  fetchTenantList()
}

// 打开添加对话框
const openAddDialog = () => {
  dialogType.value = 'add'
  resetForm()
  dialogVisible.value = true
}

// 打开编辑对话框
const openEditDialog = (row) => {
  dialogType.value = 'edit'
  Object.assign(tenantForm, row)
  dialogVisible.value = true
}

// 重置表单
const resetForm = () => {
  if (tenantFormRef.value) {
    tenantFormRef.value.resetFields()
  }
  Object.assign(tenantForm, {
    id: '',
    name: '',
    code: '',
    contact: '',
    phone: '',
    email: '',
    remark: '',
    status: '1'
  })
}

// 保存租户
const handleSave = async () => {
  if (!tenantFormRef.value) return
  
  try {
    const valid = await tenantFormRef.value.validate()
    if (!valid) return
    
    // 这里应该调用后端API保存数据
    // 暂时使用模拟数据
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (dialogType.value === 'add') {
      // 模拟添加数据
      const newTenant = {
        id: Date.now().toString(),
        ...tenantForm,
        createTime: new Date().toISOString().slice(0, 19).replace('T', ' ')
      }
      tenantList.value.unshift(newTenant)
      pagination.total += 1
    } else {
      // 模拟更新数据
      const index = tenantList.value.findIndex(item => item.id === tenantForm.id)
      if (index !== -1) {
        Object.assign(tenantList.value[index], tenantForm)
      }
    }
    
    dialogVisible.value = false
    ElMessage.success(`${dialogType.value === 'add' ? '添加' : '编辑'}租户成功`)
  } catch (error) {
    if (error.name !== 'Error') {
      // 表单验证错误
      return
    }
    ElMessage.error(`${dialogType.value === 'add' ? '添加' : '编辑'}租户失败`)
    console.error(error)
  }
}

// 变更状态
const handleStatusChange = async (row) => {
  try {
    // 这里应该调用后端API变更状态
    // 暂时使用模拟数据
    await new Promise(resolve => setTimeout(resolve, 500))
    
    ElMessage.success(`租户状态已${row.status === '1' ? '启用' : '禁用'}`)
  } catch (error) {
    // 变更失败，恢复原始状态
    row.status = row.status === '1' ? '0' : '1'
    ElMessage.error('变更租户状态失败')
    console.error(error)
  }
}

// 删除租户
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除租户"${row.name}"吗？`,
      '确认删除',
      {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }
    )
    
    // 这里应该调用后端API删除数据
    // 暂时使用模拟数据
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const index = tenantList.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      tenantList.value.splice(index, 1)
      pagination.total -= 1
    }
    
    ElMessage.success('删除租户成功')
  } catch (error) {
    if (error === 'cancel') {
      // 用户取消删除
      return
    }
    ElMessage.error('删除租户失败')
    console.error(error)
  }
}
</script>

<style scoped>
.tenant-manage {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>