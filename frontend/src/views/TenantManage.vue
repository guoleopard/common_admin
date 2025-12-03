<template>
  <div class="tenant-container" :class="{ dark: isDark }">
    <el-card>
      <div class="card-header">
        <h2>租户管理</h2>
        <el-button type="primary" @click="openAddDialog">
          <el-icon><Plus /></el-icon>
          新增租户
        </el-button>
      </div>
      <div class="search-bar">
        <el-input
          v-model="searchForm.tenantName"
          placeholder="请输入租户名称"
          style="width: 200px; margin-right: 10px"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-input
          v-model="searchForm.contactPerson"
          placeholder="请输入联系人"
          style="width: 200px; margin-right: 10px"
          clearable
        >
          <template #prefix>
            <el-icon><User /></el-icon>
          </template>
        </el-input>
        <el-select
          v-model="searchForm.status"
          placeholder="请选择状态"
          style="width: 150px; margin-right: 10px"
          clearable
        >
          <el-option label="启用" value="1" />
          <el-option label="禁用" value="0" />
        </el-select>
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
        <el-table-column prop="tenantName" label="租户名称" align="center" />
        <el-table-column prop="tenantCode" label="租户编码" align="center" />
        <el-table-column prop="contactPerson" label="联系人" align="center" />
        <el-table-column prop="contactPhone" label="联系电话" align="center" />
        <el-table-column prop="email" label="邮箱" align="center" />
        <el-table-column prop="address" label="地址" align="center" />
        <el-table-column prop="status" label="状态" align="center">
          <template #default="scope">
            <el-switch v-model="scope.row.status" active-value="1" inactive-value="0" @change="updateStatus(scope.row)" />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" align="center" />
        <el-table-column prop="expireTime" label="过期时间" align="center" />
        <el-table-column label="操作" align="center" width="200">
          <template #default="scope">
            <el-button size="small" @click="editTenant(scope.row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button size="small" type="danger" @click="deleteTenant(scope.row)">
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

    <!-- 添加/编辑租户弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form :model="formData" label-width="100px">
        <el-form-item label="租户名称" prop="tenantName" :rules="[{ required: true, message: '请输入租户名称', trigger: 'blur' }]">
          <el-input v-model="formData.tenantName" placeholder="请输入租户名称" />
        </el-form-item>
        <el-form-item label="租户编码" prop="tenantCode" :rules="[{ required: true, message: '请输入租户编码', trigger: 'blur' }]">
          <el-input v-model="formData.tenantCode" placeholder="请输入租户编码" />
        </el-form-item>
        <el-form-item label="联系人" prop="contactPerson" :rules="[{ required: true, message: '请输入联系人', trigger: 'blur' }]">
          <el-input v-model="formData.contactPerson" placeholder="请输入联系人" />
        </el-form-item>
        <el-form-item label="联系电话" prop="contactPhone" :rules="[{ required: true, message: '请输入联系电话', trigger: 'blur' }]">
          <el-input v-model="formData.contactPhone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email" :rules="[{ type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }]">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="formData.address" placeholder="请输入地址" />
        </el-form-item>
        <el-form-item label="过期时间" prop="expireTime" :rules="[{ required: true, message: '请选择过期时间', trigger: 'change' }]">
          <el-date-picker
            v-model="formData.expireTime"
            type="date"
            placeholder="请选择过期时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="formData.status" active-value="1" inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveTenant">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { useThemeStore } from '../store/modules/theme'
import { ref, onMounted } from 'vue'
import { Plus, Search, User, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const themeStore = useThemeStore()
const isDark = ref(themeStore.isDark)

const dialogVisible = ref(false)
const dialogTitle = ref('新增租户')
const formData = ref({
  id: '',
  tenantName: '',
  tenantCode: '',
  contactPerson: '',
  contactPhone: '',
  email: '',
  address: '',
  status: '1',
  expireTime: ''
})

const searchForm = ref({
  tenantName: '',
  contactPerson: '',
  status: ''
})

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

const tableData = ref([
  {
    id: 1,
    tenantName: '租户A',
    tenantCode: 'tenant_a',
    contactPerson: '张三',
    contactPhone: '13800138000',
    email: 'zhangsan@example.com',
    address: '北京市朝阳区',
    status: '1',
    createTime: '2024-01-01 10:00:00',
    expireTime: '2025-01-01'
  },
  {
    id: 2,
    tenantName: '租户B',
    tenantCode: 'tenant_b',
    contactPerson: '李四',
    contactPhone: '13800138001',
    email: 'lisi@example.com',
    address: '上海市浦东新区',
    status: '1',
    createTime: '2024-01-02 10:00:00',
    expireTime: '2025-01-02'
  },
  {
    id: 3,
    tenantName: '租户C',
    tenantCode: 'tenant_c',
    contactPerson: '王五',
    contactPhone: '13800138002',
    email: 'wangwu@example.com',
    address: '广州市天河区',
    status: '0',
    createTime: '2024-01-03 10:00:00',
    expireTime: '2024-06-03'
  }
])

const openAddDialog = () => {
  dialogTitle.value = '新增租户'
  formData.value = {
    id: '',
    tenantName: '',
    tenantCode: '',
    contactPerson: '',
    contactPhone: '',
    email: '',
    address: '',
    status: '1',
    expireTime: ''
  }
  dialogVisible.value = true
}

const editTenant = (row) => {
  dialogTitle.value = '编辑租户'
  formData.value = { ...row }
  dialogVisible.value = true
}

const deleteTenant = (row) => {
  ElMessageBox.confirm(
    '确定要删除这个租户吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const updateStatus = (row) => {
  ElMessage.success(`租户状态已更新为${row.status === '1' ? '启用' : '禁用'}`)
}

const saveTenant = () => {
  dialogVisible.value = false
  ElMessage.success(dialogTitle.value === '新增租户' ? '新增成功' : '编辑成功')
}

const search = () => {
  ElMessage.info('查询成功')
}

const reset = () => {
  searchForm.value = {
    tenantName: '',
    contactPerson: '',
    status: ''
  }
}

const handleSizeChange = (val) => {
  pageSize.value = val
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}

onMounted(() => {
  // 初始化租户数据
})
</script>

<style scoped>
.tenant-container {
  padding: 20px;
  min-height: 100vh;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
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
  text-align: right;
}

.dark {
  background-color: #1e1e1e;
}
</style>
