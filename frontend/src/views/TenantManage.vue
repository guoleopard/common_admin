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
          v-model="searchForm.name"
          placeholder="请输入租户名称"
          style="width: 200px; margin-right: 10px"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-input
          v-model="searchForm.contactPhone"
          placeholder="请输入联系电话"
          style="width: 200px; margin-right: 10px"
          clearable
        >
          <template #prefix>
            <el-icon><Phone /></el-icon>
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
        <el-table-column prop="name" label="租户名称" align="center" />
        <el-table-column prop="contactName" label="联系人" align="center" />
        <el-table-column prop="contactPhone" label="联系电话" align="center" />
        <el-table-column prop="email" label="邮箱" align="center" />
        <el-table-column prop="address" label="地址" align="center" />
        <el-table-column prop="userCount" label="用户数量" align="center" />
        <el-table-column prop="orderCount" label="订单数量" align="center" />
        <el-table-column prop="status" label="状态" align="center">
          <template #default="scope">
            <el-switch v-model="scope.row.status" active-value="1" inactive-value="0" />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" align="center" />
        <el-table-column prop="expireTime" label="到期时间" align="center" />
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
      <el-form :model="formData" label-width="120px">
        <el-form-item label="租户名称">
          <el-input v-model="formData.name" placeholder="请输入租户名称" />
        </el-form-item>
        <el-form-item label="联系人">
          <el-input v-model="formData.contactName" placeholder="请输入联系人姓名" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="formData.contactPhone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="formData.address" placeholder="请输入租户地址" />
        </el-form-item>
        <el-form-item label="到期时间">
          <el-date-picker
            v-model="formData.expireTime"
            type="date"
            placeholder="选择到期时间"
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
import { Plus, Search, Phone, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const themeStore = useThemeStore()
const isDark = ref(themeStore.isDark)

const dialogVisible = ref(false)
const dialogTitle = ref('新增租户')
const formData = ref({
  name: '',
  contactName: '',
  contactPhone: '',
  email: '',
  address: '',
  expireTime: '',
  status: '1'
})

const searchForm = ref({
  name: '',
  contactPhone: '',
  status: ''
})

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

const tableData = ref([
  {
    id: 1,
    name: '科技有限公司',
    contactName: '张三',
    contactPhone: '13800138000',
    email: 'zhangsan@example.com',
    address: '北京市朝阳区',
    userCount: 25,
    orderCount: 128,
    status: '1',
    createTime: '2024-01-01 10:00:00',
    expireTime: '2025-01-01'
  },
  {
    id: 2,
    name: '电商平台',
    contactName: '李四',
    contactPhone: '13800138001',
    email: 'lisi@example.com',
    address: '上海市浦东新区',
    userCount: 156,
    orderCount: 2345,
    status: '1',
    createTime: '2024-01-02 10:00:00',
    expireTime: '2025-01-02'
  },
  {
    id: 3,
    name: '教育机构',
    contactName: '王五',
    contactPhone: '13800138002',
    email: 'wangwu@example.com',
    address: '广州市天河区',
    userCount: 89,
    orderCount: 678,
    status: '0',
    createTime: '2024-01-03 10:00:00',
    expireTime: '2024-12-31'
  }
])

const openAddDialog = () => {
  dialogTitle.value = '新增租户'
  formData.value = {
    name: '',
    contactName: '',
    contactPhone: '',
    email: '',
    address: '',
    expireTime: '',
    status: '1'
  }
  dialogVisible.value = true
}

const editTenant = (row) => {
  dialogTitle.value = '编辑租户'
  formData.value = {
    ...row
  }
  dialogVisible.value = true
}

const deleteTenant = (row) => {
  ElMessage.success('删除成功')
}

const search = () => {
  ElMessage.success('查询成功')
}

const reset = () => {
  searchForm.value = {
    name: '',
    contactPhone: '',
    status: ''
  }
}

const saveTenant = () => {
  ElMessage.success('保存成功')
  dialogVisible.value = false
}

const handleSizeChange = (val) => {
  pageSize.value = val
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}
</script>

<style scoped>
.tenant-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-bar {
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>