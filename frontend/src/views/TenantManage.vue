<template>
  <div class="tenant-manage">
    <div class="page-header">
      <h2>租户管理</h2>
      <el-button type="primary" @click="showAddDialog">
        <el-icon><Plus /></el-icon>
        添加租户
      </el-button>
    </div>

    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="租户名称">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入租户名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 120px"
          >
            <el-option label="启用" value="1" />
            <el-option label="禁用" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table
        :data="tenantList"
        border
        stripe
        style="width: 100%"
        max-height="600"
      >
        <el-table-column type="index" label="序号" width="80" />
        <el-table-column prop="name" label="租户名称" min-width="150" />
        <el-table-column prop="code" label="租户编码" min-width="120" />
        <el-table-column prop="contact" label="联系人" min-width="100" />
        <el-table-column prop="phone" label="联系电话" min-width="130" />
        <el-table-column prop="email" label="邮箱" min-width="150" />
        <el-table-column prop="address" label="地址" min-width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="showEditDialog(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="showDeleteDialog(row.id)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        class="pagination"
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pagination.pageNum"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pagination.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total"
      />
    </el-card>

    <!-- 添加/编辑租户对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="tenantFormRef"
        :model="tenantForm"
        :rules="tenantRules"
        label-width="120px"
      >
        <el-form-item label="租户名称" prop="name">
          <el-input
            v-model="tenantForm.name"
            placeholder="请输入租户名称"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="租户编码" prop="code">
          <el-input
            v-model="tenantForm.code"
            placeholder="请输入租户编码"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="联系人" prop="contact">
          <el-input
            v-model="tenantForm.contact"
            placeholder="请输入联系人"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input
            v-model="tenantForm.phone"
            placeholder="请输入联系电话"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="tenantForm.email"
            placeholder="请输入邮箱"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input
            v-model="tenantForm.address"
            placeholder="请输入地址"
            style="width: 100%"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select
            v-model="tenantForm.status"
            placeholder="请选择状态"
            style="width: 100%"
          >
            <el-option label="启用" value="1" />
            <el-option label="禁用" value="0" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 删除确认对话框 -->
    <el-dialog
      v-model="deleteDialogVisible"
      title="确认删除"
      width="400px"
      @close="deleteDialogVisible = false"
    >
      <span>确定要删除该租户吗？此操作不可撤销。</span>
      <template #footer>
        <el-button @click="deleteDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="handleDelete">确定删除</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Search, Refresh, Edit, Delete } from '@element-plus/icons-vue'

const tenantList = ref([])
const searchForm = reactive({
  name: '',
  status: ''
})
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})
const dialogVisible = ref(false)
const dialogTitle = ref('添加租户')
const tenantFormRef = ref(null)
const tenantForm = reactive({
  id: '',
  name: '',
  code: '',
  contact: '',
  phone: '',
  email: '',
  address: '',
  status: 1
})
const tenantRules = {
  name: [
    { required: true, message: '请输入租户名称', trigger: 'blur' },
    { min: 2, max: 50, message: '租户名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入租户编码', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_-]+$/, message: '租户编码只能包含字母、数字、下划线和短横线', trigger: 'blur' }
  ],
  contact: [
    { required: true, message: '请输入联系人', trigger: 'blur' },
    { min: 2, max: 20, message: '联系人长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
}
const deleteDialogVisible = ref(false)
const deleteTenantId = ref('')

// 模拟数据
const mockTenants = [
  {
    id: '1',
    name: '阿里巴巴集团',
    code: 'alibaba',
    contact: '张三',
    phone: '13800138001',
    email: 'zhangsan@alibaba.com',
    address: '浙江省杭州市余杭区文一西路969号',
    status: 1,
    createTime: '2024-01-01 10:00:00'
  },
  {
    id: '2',
    name: '腾讯科技',
    code: 'tencent',
    contact: '李四',
    phone: '13800138002',
    email: 'lisi@tencent.com',
    address: '广东省深圳市南山区科技园腾讯大厦',
    status: 1,
    createTime: '2024-01-02 14:30:00'
  },
  {
    id: '3',
    name: '百度在线',
    code: 'baidu',
    contact: '王五',
    phone: '13800138003',
    email: 'wangwu@baidu.com',
    address: '北京市海淀区上地十街10号',
    status: 0,
    createTime: '2024-01-03 09:15:00'
  }
]

onMounted(() => {
  fetchTenantList()
})

const fetchTenantList = () => {
  // 模拟API请求
  setTimeout(() => {
    let filteredData = [...mockTenants]
    if (searchForm.name) {
      filteredData = filteredData.filter(item => 
        item.name.includes(searchForm.name)
      )
    }
    if (searchForm.status !== '') {
      filteredData = filteredData.filter(item => 
        item.status === parseInt(searchForm.status)
      )
    }
    pagination.total = filteredData.length
    const start = (pagination.pageNum - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    tenantList.value = filteredData.slice(start, end)
  }, 300)
}

const handleSearch = () => {
  pagination.pageNum = 1
  fetchTenantList()
}

const handleReset = () => {
  searchForm.name = ''
  searchForm.status = ''
  pagination.pageNum = 1
  fetchTenantList()
}

const handleSizeChange = (val) => {
  pagination.pageSize = val
  pagination.pageNum = 1
  fetchTenantList()
}

const handleCurrentChange = (val) => {
  pagination.pageNum = val
  fetchTenantList()
}

const showAddDialog = () => {
  dialogTitle.value = '添加租户'
  resetForm()
  dialogVisible.value = true
}

const showEditDialog = (row) => {
  dialogTitle.value = '编辑租户'
  Object.assign(tenantForm, row)
  dialogVisible.value = true
}

const handleDialogClose = () => {
  resetForm()
}

const resetForm = () => {
  tenantForm.id = ''
  tenantForm.name = ''
  tenantForm.code = ''
  tenantForm.contact = ''
  tenantForm.phone = ''
  tenantForm.email = ''
  tenantForm.address = ''
  tenantForm.status = 1
  if (tenantFormRef.value) {
    tenantFormRef.value.resetFields()
  }
}

const handleSubmit = () => {
  tenantFormRef.value.validate((valid) => {
    if (valid) {
      // 模拟API请求
      setTimeout(() => {
        if (tenantForm.id) {
          // 编辑
          const index = mockTenants.findIndex(item => item.id === tenantForm.id)
          if (index !== -1) {
            mockTenants[index] = { ...tenantForm }
          }
          ElMessage.success('租户编辑成功')
        } else {
          // 添加
          tenantForm.id = Date.now().toString()
          tenantForm.createTime = new Date().toISOString().slice(0, 19).replace('T', ' ')
          mockTenants.unshift(tenantForm)
          ElMessage.success('租户添加成功')
        }
        dialogVisible.value = false
        fetchTenantList()
        resetForm()
      }, 300)
    }
  })
}

const handleStatusChange = (row) => {
  // 模拟API请求
  setTimeout(() => {
    ElMessage.success(`租户状态已${row.status ? '启用' : '禁用'}`)
  }, 300)
}

const showDeleteDialog = (id) => {
  deleteTenantId.value = id
  deleteDialogVisible.value = true
}

const handleDelete = () => {
  // 模拟API请求
  setTimeout(() => {
    const index = mockTenants.findIndex(item => item.id === deleteTenantId.value)
    if (index !== -1) {
      mockTenants.splice(index, 1)
    }
    ElMessage.success('租户删除成功')
    deleteDialogVisible.value = false
    fetchTenantList()
  }, 300)
}
</script>

<style scoped>
.tenant-manage {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.search-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 15px;
  text-align: right;
}
</style>