<template>
  <div class="dept-container" :class="{ dark: isDark }">
    <el-card>
      <div class="card-header">
        <h2>部门管理</h2>
        <el-button type="primary" @click="openAddDialog">
          <el-icon><Plus /></el-icon>
          新增部门
        </el-button>
      </div>
      <div class="search-bar">
        <el-input
          v-model="searchForm.deptName"
          placeholder="请输入部门名称"
          style="width: 200px; margin-right: 10px"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-input
          v-model="searchForm.leader"
          placeholder="请输入部门负责人"
          style="width: 200px; margin-right: 10px"
          clearable
        >
          <template #prefix>
            <el-icon><User /></el-icon>
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
        <el-table-column prop="deptName" label="部门名称" align="center" />
        <el-table-column prop="parentName" label="上级部门" align="center" />
        <el-table-column prop="leader" label="负责人" align="center" />
        <el-table-column prop="phone" label="联系电话" align="center" />
        <el-table-column prop="status" label="状态" align="center">
          <template #default="scope">
            <el-switch v-model="scope.row.status" active-value="1" inactive-value="0" />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" align="center" />
        <el-table-column label="操作" align="center" width="200">
          <template #default="scope">
            <el-button size="small" @click="editDept(scope.row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button size="small" type="danger" @click="deleteDept(scope.row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
            <el-button size="small" @click="viewChildren(scope.row)">
              <el-icon><Folder /></el-icon>
              查看下级
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

    <!-- 添加/编辑部门弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="formData" label-width="100px">
        <el-form-item label="部门名称">
          <el-input v-model="formData.deptName" placeholder="请输入部门名称" />
        </el-form-item>
        <el-form-item label="上级部门">
          <el-select v-model="formData.parentId" placeholder="请选择上级部门">
            <el-option label="无" value="0" />
            <el-option
              v-for="dept in deptOptions"
              :key="dept.id"
              :label="dept.deptName"
              :value="dept.id"
              :disabled="formData.id && dept.id === formData.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="负责人">
          <el-input v-model="formData.leader" placeholder="请输入部门负责人" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="formData.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="formData.status" active-value="1" inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveDept">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 下级部门弹窗 -->
    <el-dialog v-model="childrenVisible" title="下级部门" width="700px">
      <el-table
        :data="childrenData"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="deptName" label="部门名称" align="center" />
        <el-table-column prop="leader" label="负责人" align="center" />
        <el-table-column prop="phone" label="联系电话" align="center" />
        <el-table-column prop="status" label="状态" align="center">
          <template #default="scope">
            <el-tag type="success" v-if="scope.row.status === '1'">启用</el-tag>
            <el-tag type="danger" v-else>禁用</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { useThemeStore } from '../store/modules/theme'
import { ref, onMounted } from 'vue'
import { Plus, Search, User, Edit, Delete, Folder } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const themeStore = useThemeStore()
const isDark = ref(themeStore.isDark)

const dialogVisible = ref(false)
const childrenVisible = ref(false)
const dialogTitle = ref('新增部门')
const formData = ref({
  id: '',
  deptName: '',
  parentId: '0',
  leader: '',
  phone: '',
  status: '1'
})

const searchForm = ref({
  deptName: '',
  leader: ''
})

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

const deptOptions = ref([
  { id: 1, deptName: '技术部' },
  { id: 2, deptName: '产品部' },
  { id: 3, deptName: '运营部' }
])

const tableData = ref([
  { id: 1, deptName: '技术部', parentName: '无', leader: '张三', phone: '13800138000', status: '1', createTime: '2024-01-01 10:00:00' },
  { id: 2, deptName: '前端组', parentName: '技术部', leader: '李四', phone: '13800138001', status: '1', createTime: '2024-01-02 10:00:00' },
  { id: 3, deptName: '后端组', parentName: '技术部', leader: '王五', phone: '13800138002', status: '1', createTime: '2024-01-03 10:00:00' },
  { id: 4, deptName: '产品部', parentName: '无', leader: '赵六', phone: '13800138003', status: '1', createTime: '2024-01-04 10:00:00' }
])

const childrenData = ref([])

const openAddDialog = () => {
  dialogTitle.value = '新增部门'
  formData.value = {
    id: '',
    deptName: '',
    parentId: '0',
    leader: '',
    phone: '',
    status: '1'
  }
  dialogVisible.value = true
}

const editDept = (row) => {
  dialogTitle.value = '编辑部门'
  formData.value = { ...row }
  dialogVisible.value = true
}

const deleteDept = (row) => {
  ElMessage.success('删除成功')
}

const viewChildren = (row) => {
  childrenData.value = tableData.value.filter(dept => dept.parentId === row.id || dept.parentName === row.deptName)
  childrenVisible.value = true
  if (childrenData.value.length === 0) {
    ElMessage.info('该部门暂无下级部门')
  }
}

const saveDept = () => {
  dialogVisible.value = false
  ElMessage.success('保存成功')
}

const search = () => {
  ElMessage.info('查询成功')
}

const reset = () => {
  searchForm.value = {
    deptName: '',
    leader: ''
  }
}

const handleSizeChange = (val) => {
  pageSize.value = val
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}

onMounted(() => {
  // 初始化部门数据
})
</script>

<style scoped>
.dept-container {
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