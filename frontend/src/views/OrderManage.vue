<template>
  <div class="order-manage">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户订单管理</span>
        </div>
      </template>
      
      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input
          v-model="searchForm.orderNo"
          placeholder="请输入订单编号"
          style="width: 200px"
          clearable
        >
          <template #append>
            <el-button @click="handleSearch">
              <el-icon><Search /></el-icon>
            </el-button>
          </template>
        </el-input>
        
        <el-input
          v-model="searchForm.username"
          placeholder="请输入用户名"
          style="width: 200px"
          clearable
        />
        
        <el-select
          v-model="searchForm.status"
          placeholder="请选择订单状态"
          style="width: 150px"
          clearable
        >
          <el-option label="待支付" value="1" />
          <el-option label="已支付" value="2" />
          <el-option label="已发货" value="3" />
          <el-option label="已完成" value="4" />
          <el-option label="已取消" value="5" />
        </el-select>
        
        <el-date-picker
          v-model="searchForm.createTimeRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 300px"
        />
      </div>
      
      <!-- 订单列表 -->
      <el-table
        v-loading="loading"
        :data="orderList"
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
          prop="orderNo"
          label="订单编号"
          width="180"
        />
        <el-table-column
          prop="username"
          label="用户名"
          width="120"
        />
        <el-table-column
          prop="totalAmount"
          label="订单金额"
          width="120"
        >
          <template #default="scope">
            ¥{{ scope.row.totalAmount.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="status"
          label="订单状态"
          width="120"
          align="center"
        >
          <template #default="scope">
            <el-tag
              :type="getStatusTagType(scope.row.status)"
              :size="'small'"
            >
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="createTime"
          label="创建时间"
          width="180"
        />
        <el-table-column
          prop="payTime"
          label="支付时间"
          width="180"
        />
        <el-table-column
          prop="deliveryTime"
          label="发货时间"
          width="180"
        />
        <el-table-column
          prop="completeTime"
          label="完成时间"
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
              @click="viewOrderDetail(scope.row)"
            >
              <el-icon><View /></el-icon>
              查看详情
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="handleCancelOrder(scope.row)"
              :disabled="scope.row.status !== '1'"
            >
              <el-icon><Delete /></el-icon>
              取消订单
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
    
    <!-- 订单详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="订单详情"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-if="currentOrder" class="order-detail">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form label-width="100px">
              <el-form-item label="订单编号">
                <span>{{ currentOrder.orderNo }}</span>
              </el-form-item>
              <el-form-item label="用户名">
                <span>{{ currentOrder.username }}</span>
              </el-form-item>
              <el-form-item label="订单金额">
                <span style="color: #ff4d4f; font-weight: bold;">¥{{ currentOrder.totalAmount.toFixed(2) }}</span>
              </el-form-item>
              <el-form-item label="订单状态">
                <el-tag
                  :type="getStatusTagType(currentOrder.status)"
                  :size="'small'"
                >
                  {{ getStatusText(currentOrder.status) }}
                </el-tag>
              </el-form-item>
            </el-form>
          </el-col>
          <el-col :span="12">
            <el-form label-width="100px">
              <el-form-item label="创建时间">
                <span>{{ currentOrder.createTime }}</span>
              </el-form-item>
              <el-form-item label="支付时间">
                <span>{{ currentOrder.payTime || '-' }}</span>
              </el-form-item>
              <el-form-item label="发货时间">
                <span>{{ currentOrder.deliveryTime || '-' }}</span>
              </el-form-item>
              <el-form-item label="完成时间">
                <span>{{ currentOrder.completeTime || '-' }}</span>
              </el-form-item>
            </el-form>
          </el-col>
        </el-row>
        
        <el-divider />
        
        <h3>订单商品</h3>
        <el-table
          :data="currentOrder.products"
          style="width: 100%"
          size="small"
        >
          <el-table-column
            prop="name"
            label="商品名称"
            width="200"
          />
          <el-table-column
            prop="price"
            label="商品单价"
            width="120"
          >
            <template #default="scope">
              ¥{{ scope.row.price.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="quantity"
            label="购买数量"
            width="120"
            align="center"
          />
          <el-table-column
            prop="amount"
            label="商品总价"
            width="120"
          >
            <template #default="scope">
              ¥{{ scope.row.amount.toFixed(2) }}
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, View, Delete } from '@element-plus/icons-vue'

// 状态管理
const loading = ref(false)
const detailDialogVisible = ref(false)
const currentOrder = ref(null)

// 搜索表单
const searchForm = reactive({
  orderNo: '',
  username: '',
  status: '',
  createTimeRange: []
})

// 分页
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 订单列表
const orderList = ref([])

// 页面加载时获取订单列表
onMounted(() => {
  fetchOrderList()
})

// 获取订单列表
const fetchOrderList = async () => {
  loading.value = true
  try {
    // 这里应该调用后端API获取数据
    // 暂时使用模拟数据
    await new Promise(resolve => setTimeout(resolve, 500))
    
    orderList.value = [
      {
        id: '1',
        orderNo: 'ORD2023000001',
        username: 'zhangsan',
        totalAmount: 129.99,
        status: '1',
        createTime: '2023-01-01 12:00:00',
        payTime: null,
        deliveryTime: null,
        completeTime: null,
        products: [
          {
            id: '1',
            name: '商品A',
            price: 59.99,
            quantity: 1,
            amount: 59.99
          },
          {
            id: '2',
            name: '商品B',
            price: 69.99,
            quantity: 1,
            amount: 69.99
          }
        ]
      },
      {
        id: '2',
        orderNo: 'ORD2023000002',
        username: 'lisi',
        totalAmount: 89.99,
        status: '2',
        createTime: '2023-01-02 12:00:00',
        payTime: '2023-01-02 12:05:00',
        deliveryTime: null,
        completeTime: null,
        products: [
          {
            id: '3',
            name: '商品C',
            price: 89.99,
            quantity: 1,
            amount: 89.99
          }
        ]
      },
      {
        id: '3',
        orderNo: 'ORD2023000003',
        username: 'wangwu',
        totalAmount: 259.98,
        status: '4',
        createTime: '2023-01-03 12:00:00',
        payTime: '2023-01-03 12:10:00',
        deliveryTime: '2023-01-04 10:00:00',
        completeTime: '2023-01-06 15:30:00',
        products: [
          {
            id: '4',
            name: '商品D',
            price: 129.99,
            quantity: 2,
            amount: 259.98
          }
        ]
      }
    ]
    
    pagination.total = orderList.value.length
  } catch (error) {
    ElMessage.error('获取订单列表失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 获取订单状态文本
const getStatusText = (status) => {
  const statusMap = {
    '1': '待支付',
    '2': '已支付',
    '3': '已发货',
    '4': '已完成',
    '5': '已取消'
  }
  return statusMap[status] || '未知状态'
}

// 获取订单状态标签类型
const getStatusTagType = (status) => {
  const typeMap = {
    '1': 'warning',
    '2': 'success',
    '3': 'info',
    '4': 'success',
    '5': 'danger'
  }
  return typeMap[status] || 'default'
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  fetchOrderList()
}

// 分页变更
const handlePageChange = () => {
  fetchOrderList()
}

// 查看订单详情
const viewOrderDetail = (row) => {
  currentOrder.value = row
  detailDialogVisible.value = true
}

// 取消订单
const handleCancelOrder = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要取消订单"${row.orderNo}"吗？`,
      '确认取消订单',
      {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }
    )
    
    // 这里应该调用后端API取消订单
    // 暂时使用模拟数据
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 模拟取消订单
    row.status = '5'
    
    ElMessage.success('取消订单成功')
  } catch (error) {
    if (error === 'cancel') {
      // 用户取消操作
      return
    }
    ElMessage.error('取消订单失败')
    console.error(error)
  }
}
</script>

<style scoped>
.order-manage {
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
  flex-wrap: wrap;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.order-detail {
  padding: 10px 0;
}
</style>