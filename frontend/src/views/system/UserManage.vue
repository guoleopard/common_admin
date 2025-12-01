<template>
  <div class="user-container" :class="{ dark: isDark }">
    <el-card>
      <div class="card-header">
        <h2>用户管理</h2>
        <el-button type="primary" @click="openAddDialog">
          <el-icon><Plus /></el-icon>
          新增用户
        </el-button>
      </div>
      <div class="search-bar">
        <el-input
          v-model="searchForm.username"
          placeholder="请输入用户名"
          style="width: 200px; margin-right: 10px"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-input
          v-model="searchForm.mobile"
          placeholder="请输入手机号"
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
        <el-table-column prop="username" label="用户名" align="center" />
        <el-table-column prop="realName" label="真实姓名" align="center" />
        <el-table-column prop="mobile" label="手机号" align="center" />
        <el-table-column prop="email" label="邮箱" align="center" />
        <el-table-column prop="roleName" label="角色" align="center" />
        <el-table-column prop="status" label="状态" align="center">
          <template #default="scope">
            <el-switch v-model="scope.row.status" active-value="1" inactive-value="0" />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" align="center" />
        <el-table-column label="操作" align="center" width="200">
          <template #default="scope">
            <el-button size="small" @click="editUser(scope.row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button size="small" type="danger" @click="deleteUser(scope.row)">
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

    <!-- 添加/编辑用户弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="formData" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="formData.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="真实姓名">
          <el-input v-model="formData.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="formData.mobile" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="formData.roleId" placeholder="请选择角色">
            <el-option label="管理员" value="1" />
            <el-option label="普通用户" value="2" />
            <el-option label="访客" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="formData.status" active-value="1" inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveUser">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { useThemeStore } from '../../store/modules/theme'
import { ref, onMounted } from 'vue'
import { Plus, Search, Phone, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const themeStore = useThemeStore()
const isDark = ref(themeStore.isDark)

const dialogVisible = ref(false)
const dialogTitle = ref('新增用户')
const formData = ref({
  username: '',
  realName: '',
  mobile: '',
  email: '',
  roleId: '',
  status: '1'
})

const searchForm = ref({
  username: '',
  mobile: ''
})

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

const tableData = ref([
  {
    id: 1,
    username: 'admin',
    realName: '管理员',
    mobile: '13800138000',
    email: 'admin@example.com',
    roleName: '管理员',
    status: '1',
    createTime: '2024-01-01 10:00:00'
  },
  {
    id: 2,
    username: 'user1',
    realName: '张三',
    mobile: '13800138001',
    email: 'user1@example.com',
    roleName: '普通用户',
    status: '1',
    createTime: '2024-01-02 10:00:00'
  },
  {
    id: 3,
    username: 'user2',
    realName: '李四',
    mobile: '13800138002',
    email: 'user2@example.com',
    roleName: '访客',
    status: '0',
    createTime: '2024-01-03 10:00:00'
  }
])

const openAddDialog = () => {
  dialogTitle.value = '新增用户'
  formData.value = {
    username: '',
    realName: '',
    mobile: '',
    email: '',
    roleId: '',
    status: '1'
  }
  dialogVisible.value = true
}

const editUser = (row) => {
  dialogTitle.value = '编辑用户'
  formData.value = {
    ...row,
    roleId: row.roleName === '管理员' ? '1' : row.roleName === '普通用户' ? '2' : '3'
  }
  dialogVisible.value = true
}

const deleteUser = (row) => {
  ElMessage.success('删除成功')
}

const search = () => {
  ElMessage.success('查询成功')
}

const reset = () => {
  searchForm.value = {
    username: '',
    mobile: ''
  }
}

const saveUser = () => {
  ElMessage.success('保存成功')
  dialogVisible.value = false
}

const handleSizeChange = (val) => {
  pageSize.value = val
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}

onMounted(() => {
  isDark.value = themeStore.isDark
})
</script>

<style scoped>
.user-container {
  width: 100%;
  height: 100%;
}
.user-container {
  width: 100%;
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-header h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.user-container.dark .card-header h2 {
  color: #fff;
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
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>