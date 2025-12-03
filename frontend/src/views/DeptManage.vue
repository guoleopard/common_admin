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
      <div class="tree-container" style="margin-top: 20px;">
        <el-tree
          :data="treeData"
          :props="treeProps"
          node-key="id"
          default-expand-all
          highlight-current
          :render-content="renderTreeContent"
        >
          <template #default="{ node, data }">
            <span class="tree-node-content">
              <el-icon v-if="data.children && data.children.length > 0"><Folder /></el-icon>
              <el-icon v-else><OfficeBuilding /></el-icon>
              <span>{{ data.deptName }}</span>
            </span>
          </template>
        </el-tree>
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
  </div>
</template>

<script setup>
import { useThemeStore } from '../store/modules/theme'
import { ref, onMounted, computed } from 'vue'
import { Plus, Search, User, Edit, Delete, Folder, OfficeBuilding } from '@element-plus/icons-vue'
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

const deptOptions = ref([
  { id: 1, deptName: '技术部' },
  { id: 2, deptName: '产品部' },
  { id: 3, deptName: '运营部' }
])

// 树形结构数据
const treeData = ref([
  {
    id: 1,
    deptName: '技术部',
    leader: '张三',
    phone: '13800138000',
    status: '1',
    createTime: '2024-01-01 10:00:00',
    children: [
      {
        id: 2,
        deptName: '前端组',
        leader: '李四',
        phone: '13800138001',
        status: '1',
        createTime: '2024-01-02 10:00:00',
        children: []
      },
      {
        id: 3,
        deptName: '后端组',
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
    leader: '赵六',
    phone: '13800138003',
    status: '1',
    createTime: '2024-01-04 10:00:00',
    children: []
  },
  {
    id: 5,
    deptName: '运营部',
    leader: '孙七',
    phone: '13800138004',
    status: '1',
    createTime: '2024-01-05 10:00:00',
    children: []
  }
])

// 树形结构配置
const treeProps = ref({
  label: 'deptName',
  children: 'children'
})

// 渲染树形节点内容
const renderTreeContent = (h, { node, data, store }) => {
  return h('span', { class: 'tree-node-content' }, [
    h('el-icon', [
      h(data.children && data.children.length > 0 ? Folder : OfficeBuilding)
    ]),
    h('span', data.deptName),
    h('span', { class: 'tree-node-actions' }, [
      h('el-button', { 
        props: { size: 'small' },
        on: { click: () => editDept(data) }
      }, [
        h('el-icon', [h(Edit)]),
        '编辑'
      ]),
      h('el-button', { 
        props: { size: 'small', type: 'danger' },
        on: { click: () => deleteDept(data) }
      }, [
        h('el-icon', [h(Delete)]),
        '删除'
      ])
    ])
  ])
}

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

.tree-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
}

.tree-container.dark {
  background-color: #1a1a1a;
}

.tree-node-content {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  justify-content: space-between;
}

.tree-node-actions {
  display: flex;
  gap: 8px;
}

.dialog-footer {
  text-align: right;
}

.dark {
  background-color: #1e1e1e;
}
</style>