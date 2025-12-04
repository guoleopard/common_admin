<template>
  <div class="order-manage">
    <div class="page-header">
      <h2>用户订单管理</h2>
    </div>

    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="订单号">
          <el-input
            v-model="searchForm.orderNo"
            placeholder="请输入订单号"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="用户名称">
          <el-input
            v-model="searchForm.userName"
            placeholder="请输入用户名称"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择订单状态"
            clearable
            style="width: 120px"
          >
            <el-option label="待支付" value="0" />
            <el-option label="已支付" value="1" />
            <el-option label="已发货" value="2" />
            <el-option label="已完成" value="3" />
            <el-option label="已取消" value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="searchForm.createTime"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 300px"
          />
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
        :data="orderList"
        border
        stripe
        style="width: 100%"
        max-height="600"
      >
        <el-table-column type="index" label="序号" width="80" />
        <el-table-column prop="orderNo" label="订单号" min-width="180" />
        <el-table-column prop="userName" label="用户名称" min-width="120" />
        <el-table-column prop="userPhone" label="用户电话" min-width="130" />
        <el-table-column prop="totalAmount" label="订单金额" min-width="120">
          <template #default="{ row }">
            ¥{{ row.totalAmount.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="订单状态" min-width="100">
          <template #default="{ row }">
            <el-tag
              :type="getStatusTagType(row.status)"
              size="small"
            >
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="payTime" label="支付时间" min-width="180" />
        <el-table-column prop="shipTime" label="发货时间" min-width="180" />
        <el-table-column prop="completeTime" label="完成时间" min-width="180" />
        <el-table-column prop="createTime" label="创建时间" min-width="180" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="showOrderDetail(row)">
              <el-icon><View /></el-icon>
              查看详情
            </el-button>
            <el-button
              type="success"
              size="small"
              @click="handleShip(row)"
              v-if="row.status === 1"
            >
              <el-icon><Van /></el-icon>
              发货
            </el-button>
            <el-button
              type="warning"
              size="small"
              @click="handleCancel(row)"
              v-if="row.status === 0"
            >
              <el-icon><Close /></el-icon>
              取消
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

    <!-- 订单详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="订单详情"
      width="800px"
      @close="detailDialogVisible = false"
    >
      <div v-if="currentOrder" class="order-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">{{ currentOrder.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="用户名称">{{ currentOrder.userName }}</el-descriptions-item>
          <el-descriptions-item label="用户电话">{{ currentOrder.userPhone }}</el-descriptions-item>
          <el-descriptions-item label="用户地址">{{ currentOrder.userAddress }}</el-descriptions-item>
          <el-descriptions-item label="订单金额">¥{{ currentOrder.totalAmount.toFixed(2) }}</el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="getStatusTagType(currentOrder.status)">
              {{ getStatusText(currentOrder.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentOrder.createTime }}</el-descriptions-item>
          <el-descriptions-item label="支付时间">{{ currentOrder.payTime || '未支付' }}</el-descriptions-item>
          <el-descriptions-item label="发货时间">{{ currentOrder.shipTime || '未发货' }}</el-descriptions-item>
          <el-descriptions-item label="完成时间">{{ currentOrder.completeTime || '未完成' }}</el-descriptions-item>
        </el-descriptions>

        <div class="order-items-title">订单商品</div>
        <el-table
          :data="currentOrder.items"
          border
          stripe
          style="width: 100%; margin-top: 10px"
        >
          <el-table-column prop="productName" label="商品名称" min-width="200" />
          <el-table-column prop="productCode" label="商品编码" min-width="150" />
          <el-table-column prop="quantity" label="数量" width="100" />
          <el-table-column prop="price" label="单价" width="120">
            <template #default="{ row }">
              ¥{{ row.price.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="totalPrice" label="小计" width="120">
            <template #default="{ row }">
              ¥{{ row.totalPrice.toFixed(2) }}
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>

    <!-- 删除确认对话框 -->
    <el-dialog
      v-model="deleteDialogVisible"
      title="确认删除"
      width="400px"
      @close="deleteDialogVisible = false"
    >
      <span>确定要删除该订单吗？此操作不可撤销。</span>
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
import { Search, Refresh, View, Van, Close, Delete } from '@element-plus/icons-vue'

const orderList = ref([])
const searchForm = reactive({
  orderNo: '',
  userName: '',
  status: '',
  createTime: []
})
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})
const detailDialogVisible = ref(false)
const currentOrder = ref(null)
const deleteDialogVisible = ref(false)
const deleteOrderId = ref('')

// 模拟数据
const mockOrders = [
  {
    id: '1',
    orderNo: 'ORD202401010001',
    userName: '张三',
    userPhone: '13800138001',
    userAddress: '北京市朝阳区建国路88号',
    totalAmount: 299.00,
    status: 3,
    payTime: '2024-01-01 10:30:00',
    shipTime: '2024-01-01 14:00:00',
    completeTime: '2024-01-03 16:20:00',
    createTime: '2024-01-01 10:00:00',
    items: [
      {
        productName: 'iPhone 15 Pro',
        productCode: 'IP15PRO',
        quantity: 1,
        price: 7999.00,
        totalPrice: 7999.00
      }
    ]
  },
  {
    id: '2',
    orderNo: 'ORD202401020002',
    userName: '李四',
    userPhone: '13800138002',
    userAddress: '上海市浦东新区陆家嘴金融中心',
    totalAmount: 1599.00,
    status: 2,
    payTime: '2024-01-02 15:20:00',
    shipTime: '2024-01-02 16:00:00',
    completeTime: null,
    createTime: '2024-01-02 14:30:00',
    items: [
      {
        productName: '华为 Mate 60 Pro',
        productCode: 'HW60PRO',
        quantity: 1,
        price: 6999.00,
        totalPrice: 6999.00
      }
    ]
  },
  {
    id: '3',
    orderNo: 'ORD202401030003',
    userName: '王五',
    userPhone: '13800138003',
    userAddress: '广州市天河区珠江新城',
    totalAmount: 899.00,
    status: 1,
    payTime: '2024-01-03 09:45:00',
    shipTime: null,
    completeTime: null,
    createTime: '2024-01-03 09:15:00',
    items: [
      {
        productName: '小米 14',
        productCode: 'XM14',
        quantity: 1,
        price: 4999.00,
        totalPrice: 4999.00
      }
    ]
  },
  {
    id: '4',
    orderNo: 'ORD202401040004',
    userName: '赵六',
    userPhone: '13800138004',
    userAddress: '深圳市南山区科技园',
    totalAmount: 1299.00,
    status: 0,
    payTime: null,
    shipTime: null,
    completeTime: null,
    createTime: '2024-01-04 11:20:00',
    items: [
      {
        productName: 'vivo X100 Pro',
        productCode: 'VIVO100PRO',
        quantity: 1,
        price: 5999.00,
        totalPrice: 5999.00
      }
    ]
  }
]

onMounted(() => {
  fetchOrderList()
})

const fetchOrderList = () => {
  // 模拟API请求
  setTimeout(() => {
    let filteredData = [...mockOrders]
    if (searchForm.orderNo) {
      filteredData = filteredData.filter(item => 
        item.orderNo.includes(searchForm.orderNo)
      )
    }
    if (searchForm.userName) {
      filteredData = filteredData.filter(item => 
        item.userName.includes(searchForm.userName)
      )
    }
    if (searchForm.status !== '') {
      filteredData = filteredData.filter(item => 
        item.status === parseInt(searchForm.status)
      )
    }
    if (searchForm.createTime && searchForm.createTime.length === 2) {
      filteredData = filteredData.filter(item => {
        const createTime = new Date(item.createTime)
        return createTime >= searchForm.createTime[0] && createTime <= searchForm.createTime[1]
      })
    }
    pagination.total = filteredData.length
    const start = (pagination.pageNum - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    orderList.value = filteredData.slice(start, end)
  }, 300)
}

const handleSearch = () => {
  pagination.pageNum = 1
  fetchOrderList()
}

const handleReset = () => {
  searchForm.orderNo = ''
  searchForm.userName = ''
  searchForm.status = ''
  searchForm.createTime = []
  pagination.pageNum = 1
  fetchOrderList()
}

const handleSizeChange = (val) => {
  pagination.pageSize = val
  pagination.pageNum = 1
  fetchOrderList()
}

const handleCurrentChange = (val) => {
  pagination.pageNum = val
  fetchOrderList()
}

const getStatusText = (status) => {
  const statusMap = {
    0: '待支付',
    1: '已支付',
    2: '已发货',
    3: '已完成',
    4: '已取消'
  }
  return statusMap[status] || '未知状态'
}

const getStatusTagType = (status) => {
  const typeMap = {
    0: 'warning',
    1: 'primary',
    2: 'info',
    3: 'success',
    4: 'danger'
  }
  return typeMap[status] || 'default'
}

const showOrderDetail = (row) => {
  currentOrder.value = row
  detailDialogVisible.value = true
}

const handleShip = (row) => {
  // 模拟API请求
  setTimeout(() => {
    row.status = 2
    row.shipTime = new Date().toISOString().slice(0, 19).replace('T', ' ')
    ElMessage.success('订单已发货')
    fetchOrderList()
  }, 300)
}

const handleCancel = (row) => {
  // 模拟API请求
  setTimeout(() => {
    row.status = 4
    ElMessage.success('订单已取消')
    fetchOrderList()
  }, 300)
}

const showDeleteDialog = (id) => {
  deleteOrderId.value = id
  deleteDialogVisible.value = true
}

const handleDelete = () => {
  // 模拟API请求
  setTimeout(() => {
    const index = mockOrders.findIndex(item => item.id === deleteOrderId.value)
    if (index !== -1) {
      mockOrders.splice(index, 1)
    }
    ElMessage.success('订单删除成功')
    deleteDialogVisible.value = false
    fetchOrderList()
  }, 300)
}
</script>

<style scoped>
.order-manage {
  padding: 20px;
}

.page-header {
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

.order-detail {
  padding: 10px 0;
}

.order-items-title {
  margin-top: 20px;
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}
</style>