<template>
  <div class="order-container" :class="{ dark: isDark }">
    <el-card>
      <div class="card-header">
        <h2>订单管理</h2>
        <el-button type="primary" @click="openAddDialog">
          <el-icon><Plus /></el-icon>
          新增订单
        </el-button>
      </div>
      <div class="search-bar">
        <el-input
          v-model="searchForm.orderNo"
          placeholder="请输入订单号"
          style="width: 200px; margin-right: 10px"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-input
          v-model="searchForm.username"
          placeholder="请输入用户名"
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
          <el-option label="待支付" value="0" />
          <el-option label="已支付" value="1" />
          <el-option label="已发货" value="2" />
          <el-option label="已完成" value="3" />
          <el-option label="已取消" value="4" />
        </el-select>
        <el-date-picker
          v-model="searchForm.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 300px; margin-right: 10px"
          clearable
        />
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
        <el-table-column prop="orderNo" label="订单号" align="center" />
        <el-table-column prop="username" label="用户名" align="center" />
        <el-table-column prop="tenantName" label="租户名称" align="center" />
        <el-table-column prop="productName" label="产品名称" align="center" />
        <el-table-column prop="quantity" label="数量" align="center" />
        <el-table-column prop="price" label="单价" align="center">
          <template #default="scope">
            ¥{{ scope.row.price.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="totalAmount" label="总金额" align="center">
          <template #default="scope">
            ¥{{ scope.row.totalAmount.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" align="center">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" align="center" />
        <el-table-column prop="payTime" label="支付时间" align="center" />
        <el-table-column prop="deliveryTime" label="发货时间" align="center" />
        <el-table-column prop="finishTime" label="完成时间" align="center" />
        <el-table-column label="操作" align="center" width="200">
          <template #default="scope">
            <el-button size="small" @click="viewOrder(scope.row)">
              <el-icon><View /></el-icon>
              查看
            </el-button>
            <el-button size="small" @click="editOrder(scope.row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button size="small" type="danger" @click="deleteOrder(scope.row)">
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

    <!-- 添加/编辑订单弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px">
      <el-form :model="formData" label-width="120px">
        <el-form-item label="订单号">
          <el-input v-model="formData.orderNo" placeholder="系统自动生成" disabled />
        </el-form-item>
        <el-form-item label="用户名">
          <el-select v-model="formData.username" placeholder="请选择用户">
            <el-option label="user1" value="user1" />
            <el-option label="user2" value="user2" />
            <el-option label="user3" value="user3" />
          </el-select>
        </el-form-item>
        <el-form-item label="租户名称">
          <el-select v-model="formData.tenantName" placeholder="请选择租户">
            <el-option label="科技有限公司" value="科技有限公司" />
            <el-option label="电商平台" value="电商平台" />
            <el-option label="教育机构" value="教育机构" />
          </el-select>
        </el-form-item>
        <el-form-item label="产品名称">
          <el-input v-model="formData.productName" placeholder="请输入产品名称" />
        </el-form-item>
        <el-form-item label="数量">
          <el-input-number v-model="formData.quantity" :min="1" placeholder="请输入数量" />
        </el-form-item>
        <el-form-item label="单价">
          <el-input-number v-model="formData.price" :min="0" :precision="2" placeholder="请输入单价" />
        </el-form-item>
        <el-form-item label="总金额">
          <el-input v-model="formData.totalAmount" placeholder="自动计算" disabled />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="formData.status" placeholder="请选择状态">
            <el-option label="待支付" value="0" />
            <el-option label="已支付" value="1" />
            <el-option label="已发货" value="2" />
            <el-option label="已完成" value="3" />
            <el-option label="已取消" value="4" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveOrder">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { useThemeStore } from '../store/modules/theme'
import { ref, onMounted, computed } from 'vue'
import { Plus, Search, User, View, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const themeStore = useThemeStore()
const isDark = ref(themeStore.isDark)

const dialogVisible = ref(false)
const dialogTitle = ref('新增订单')
const formData = ref({
  orderNo: '',
  username: '',
  tenantName: '',
  productName: '',
  quantity: 1,
  price: 0,
  totalAmount: 0,
  status: '0'
})

const searchForm = ref({
  orderNo: '',
  username: '',
  status: '',
  dateRange: null
})

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

const tableData = ref([
  {
    id: 1,
    orderNo: 'ORD202401010001',
    username: 'user1',
    tenantName: '科技有限公司',
    productName: '产品A',
    quantity: 2,
    price: 100.00,
    totalAmount: 200.00,
    status: '1',
    createTime: '2024-01-01 10:00:00',
    payTime: '2024-01-01 10:30:00',
    deliveryTime: '2024-01-02 14:00:00',
    finishTime: '2024-01-03 16:00:00'
  },
  {
    id: 2,
    orderNo: 'ORD202401020002',
    username: 'user2',
    tenantName: '电商平台',
    productName: '产品B',
    quantity: 5,
    price: 50.00,
    totalAmount: 250.00,
    status: '2',
    createTime: '2024-01-02 10:00:00',
    payTime: '2024-01-02 11:00:00',
    deliveryTime: '2024-01-03 10:00:00',
    finishTime: ''
  },
  {
    id: 3,
    orderNo: 'ORD202401030003',
    username: 'user3',
    tenantName: '教育机构',
    productName: '产品C',
    quantity: 1,
    price: 500.00,
    totalAmount: 500.00,
    status: '0',
    createTime: '2024-01-03 10:00:00',
    payTime: '',
    deliveryTime: '',
    finishTime: ''
  }
])

const getStatusText = (status) => {
  const statusMap = {
    '0': '待支付',
    '1': '已支付',
    '2': '已发货',
    '3': '已完成',
    '4': '已取消'
  }
  return statusMap[status] || '未知'
}

const getStatusTagType = (status) => {
  const typeMap = {
    '0': 'warning',
    '1': 'success',
    '2': 'info',
    '3': 'success',
    '4': 'danger'
  }
  return typeMap[status] || 'info'
}

const openAddDialog = () => {
  dialogTitle.value = '新增订单'
  formData.value = {
    orderNo: '',
    username: '',
    tenantName: '',
    productName: '',
    quantity: 1,
    price: 0,
    totalAmount: 0,
    status: '0'
  }
  dialogVisible.value = true
}

const viewOrder = (row) => {
  ElMessage.success('查看订单详情')
}

const editOrder = (row) => {
  dialogTitle.value = '编辑订单'
  formData.value = {
    ...row
  }
  dialogVisible.value = true
}

const deleteOrder = (row) => {
  ElMessage.success('删除成功')
}

const search = () => {
  ElMessage.success('查询成功')
}

const reset = () => {
  searchForm.value = {
    orderNo: '',
    username: '',
    status: '',
    dateRange: null
  }
}

const saveOrder = () => {
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
.order-container {
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