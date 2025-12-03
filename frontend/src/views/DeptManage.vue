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
      <el-tree
        :data="treeData"
        :props="treeProps"
        :default-expand-all="true"
        node-key="id"
        style="margin-top: 20px"
      >
        <template #default="{ node, data }">
          <div class="tree-node">
            <span class="node-info">
              <span class="dept-name">{{ data.deptName }}</span>
              <span class="leader-info">负责人：{{ data.leader }}</span>
              <span class="phone-info">电话：{{ data.phone }}</span>
              <el-tag
                :type="data.status === '1' ? 'success' : 'danger'"
                size="small"
                style="margin-left: 10px"
              >
                {{ data.status === '1' ? '启用' : '禁用' }}
              </el-tag>
            </span>
            <span class="node-actions">
              <el-button
                size="small"
                @click="editDept(data)"
                style="margin-right: 5px"
              >
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button
                size="small"
                type="primary"
                @click="addChildDept(data)"
                style="margin-right: 5px"
              >
                <el-icon><Plus /></el-icon>
                添加子部门
              </el-button>
              <el-button
                size="small"
                type="danger"
                @click="deleteDept(data)"
              >
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </span>
          </div>
        </template>
      </el-tree>
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
  </div>
</template>

<script setup>
import { useThemeStore } from '../store/modules/theme'
import { ref, onMounted, computed } from 'vue'
import { Plus, Search, User, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const themeStore = useThemeStore()
const isDark = ref(themeStore.isDark)

const dialogVisible = ref(false)
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

// 树形结构配置
const treeProps = {
  children: 'children',
  label: 'deptName'
}

// 部门数据（树形结构）
const treeData = ref([
  {
    id: 1,
    deptName: '技术部',
    parentId: 0,
    leader: '张三',
    phone: '13800138000',
    status: '1',
    createTime: '2024-01-01 10:00:00',
    children: [
      {
        id: 2,
        deptName: '前端组',
        parentId: 1,
        leader: '李四',
        phone: '13800138001',
        status: '1',
        createTime: '2024-01-02 10:00:00',
        children: []
      },
      {
        id: 3,
        deptName: '后端组',
        parentId: 1,
        leader: '王五',
        phone: '13800138002',
        status: '1',
        createTime: '2024-01-03 10:00:00',
        children: []
      }
    ]
  },
  {
    id: 4,
    deptName: '产品部',
    parentId: 0,
    leader: '赵六',
    phone: '13800138003',
    status: '1',
    createTime: '2024-01-04 10:00:00',
    children: []
  },
  {
    id: 5,
    deptName: '运营部',
    parentId: 0,
    leader: '孙七',
    phone: '13800138004',
    status: '1',
    createTime: '2024-01-05 10:00:00',
    children: []
  }
])

// 扁平的部门列表，用于下拉选择
const deptOptions = computed(() => {
  const options = []
  const flattenTree = (data) => {
    data.forEach(dept => {
      options.push({ id: dept.id, deptName: dept.deptName })
      if (dept.children && dept.children.length > 0) {
        flattenTree(dept.children)
      }
    })
  }
  flattenTree(treeData.value)
  return options
})

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

const addChildDept = (parentDept) => {
  dialogTitle.value = '新增子部门'
  formData.value = {
    id: '',
    deptName: '',
    parentId: parentDept.id,
    leader: '',
    phone: '',
    status: '1'
  }
  dialogVisible.value = true
}

const editDept = (dept) => {
  dialogTitle.value = '编辑部门'
  formData.value = { ...dept }
  dialogVisible.value = true
}

const deleteDept = (dept) => {
  // 检查是否有子部门
  if (dept.children && dept.children.length > 0) {
    ElMessage.warning('该部门下有子部门，无法删除')
    return
  }
  // 删除部门
  const deleteNode = (data) => {
    for (let i = 0; i < data.length; i++) {
      if (data[i].id === dept.id) {
        data.splice(i, 1)
        return true
      }
      if (data[i].children && data[i].children.length > 0) {
        if (deleteNode(data[i].children)) {
          return true
        }
      }
    }
    return false
  }
  deleteNode(treeData.value)
  ElMessage.success('删除成功')
}

const saveDept = () => {
  if (formData.value.id) {
    // 编辑部门
    const updateNode = (data) => {
      for (let i = 0; i < data.length; i++) {
        if (data[i].id === formData.value.id) {
          data[i] = { ...formData.value, children: data[i].children || [] }
          return true
        }
        if (data[i].children && data[i].children.length > 0) {
          if (updateNode(data[i].children)) {
            return true
          }
        }
      }
      return false
    }
    updateNode(treeData.value)
    ElMessage.success('编辑成功')
  } else {
    // 新增部门
    const newDept = {
      ...formData.value,
      id: Date.now(), // 临时生成ID，实际应该由后端生成
      createTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
      children: []
    }
    
    if (newDept.parentId === '0') {
      // 新增根部门
      treeData.value.push(newDept)
    } else {
      // 新增子部门
      const addNode = (data) => {
        for (let i = 0; i < data.length; i++) {
          if (data[i].id === parseInt(newDept.parentId)) {
            if (!data[i].children) {
              data[i].children = []
            }
            data[i].children.push(newDept)
            return true
          }
          if (data[i].children && data[i].children.length > 0) {
            if (addNode(data[i].children)) {
              return true
            }
          }
        }
        return false
      }
      addNode(treeData.value)
    }
    ElMessage.success('新增成功')
  }
  dialogVisible.value = false
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

.tree-node {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
  width: 100%;
}

.node-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.dept-name {
  font-weight: 600;
  margin-right: 20px;
}

.leader-info {
  margin-right: 20px;
  color: #606266;
}

.phone-info {
  margin-right: 20px;
  color: #606266;
}

.node-actions {
  display: flex;
  align-items: center;
}

.dialog-footer {
  text-align: right;
}

.dark {
  background-color: #1e1e1e;
}

.dark .dept-name {
  color: #fff;
}

.dark .leader-info,
.dark .phone-info {
  color: #909399;
}
</style>