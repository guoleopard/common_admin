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
        <el-input
          v-model="searchForm.phone"
          placeholder="请输入联系电话"
          style="width: 200px; margin-right: 10px"
          clearable
        >
          <template #prefix>
            <el-icon><Phone /></el-icon>
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
        <el-table-column prop="tenantName" label="租户名称" align="center" />
        <el-table-column prop="contactPerson" label="联系人" align="center" />
        <el-table-column prop="phone" label="联系电话" align="center" />
        <el-table-column prop="email" label="邮箱" align="center" />
        <el-table-column prop="address" label="地址" align="center" />
        <el-table-column prop="status" label="状态" align="center">
          <template #default="scope">
            <el-switch v-model="scope.row.status" active-value="1" inactive-value="0" />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" align="center" />
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
            <el-button size="small" type="success" @click="viewTenant(scope.row)">
              <el-icon><View /></el-icon>
              查看
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
        <el-form-item label="租户名称">
          <el-input v-model="formData.tenantName" placeholder="请输入租户名称" />
        </el-form-item>
        <el-form-item label="联系人">
          <el-input v-model="formData.contactPerson" placeholder="请输入联系人" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="formData.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="formData.address" placeholder="请输入地址" />
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

    <!-- 查看租户详情弹窗 -->
    <el-dialog v-model="detailVisible" title="租户详情" width="600px">
      <el-form :model="detailData" label-width="100px">
        <el-form-item label="租户名称">
          <el-input v-model="detailData.tenantName" disabled />
        </el-form-item>
        <el-form-item label="联系人">
          <el-input v-model="detailData.contactPerson" disabled />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="detailData.phone" disabled />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="detailData.email" disabled />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="detailData.address" disabled />
        </el-form-item>
        <el-form-item label="状态">
          <el-tag type="success" v-if="detailData.status === '1'">启用</el-tag>
          <el-tag type="danger" v-else>禁用</el-tag>
        </el-form-item>
        <el-form-item label="创建时间">
          <el-input v-model="detailData.createTime" disabled />
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup>
import { useThemeStore } from '../store/modules/theme'
import { ref, onMounted } from 'vue'
import { Plus, Search, User, Edit, Delete, View, Phone } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const themeStore = useThemeStore()
const isDark = ref(themeStore.isDark)

const dialogVisible = ref(false)
const detailVisible = ref(false)
const dialogTitle = ref('新增租户')
const formData = ref({
  id: '',
  tenantName: '',
  contactPerson: '',
  phone: '',
  email: '',
  address: '',
  status: '1'
})

const detailData = ref({
  id: '',
  tenantName: '',
  contactPerson: '',
  phone: '',
  email: '',
  address: '',
  status: '1',
  createTime: ''
})

const searchForm = ref({
  tenantName: '',
  contactPerson: '',
  phone: ''
})

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

const tableData = ref([
  { id: 1, tenantName: '租户A', contactPerson: '张三', phone: '13800138000', email: 'zhangsan@example.com', address: '北京市朝阳区', status: '1', createTime: '2024-01-01 10:00:00' },
  { id: 2, tenantName: '租户B', contactPerson: '李四', phone: '13800138001', email: 'lisi@example.com', address: '上海市浦东新区', status: '1', createTime: '2024-01-02 10:00:00' },
  { id: 3, tenantName: '租户C', contactPerson: '王五', phone: '13800138002', email: 'wangwu@example.com', address: '广州市天河区', status: '1', createTime: '2024-01-03 10:00:00' },
  { id: 4, tenantName: '租户D', contactPerson: '赵六', phone: '13800138003', email: 'zhaoliu@example.com', address: '深圳市南山区', status: '1', createTime: '2024-01-04 10:00:00' }
])

const openAddDialog = () => {
  dialogTitle.value = '新增租户'
  formData.value = {
    id: '',
    tenantName: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    status: '1'
  }
  dialogVisible.value = true
}

const editTenant = (row) => {
  dialogTitle.value = '编辑租户'
  formData.value = { ...row }
  dialogVisible.value = true
}

const deleteTenant = (row) => {
  ElMessage.success('删除成功')
}

const viewTenant = (row) => {
  detailData.value = { ...row }
  detailVisible.value = true
}

const saveTenant = () => {
  dialogVisible.value = false
  ElMessage.success('保存成功')
}

const search = () => {
  ElMessage.info('查询成功')
}

const reset = () => {
  searchForm.value = {
    tenantName: '',
    contactPerson: '',
    phone: ''
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