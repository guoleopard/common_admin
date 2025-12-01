<template>
  <div class="menu-container" :class="{ dark: isDark }">
    <el-card>
      <div class="card-header">
        <h2>菜单管理</h2>
        <div class="button-group">
          <el-button type="primary" @click="addMenu">
            <el-icon><Plus /></el-icon>
            新增菜单
          </el-button>
          <el-button @click="addSubMenu" :disabled="!selectedMenu">
            <el-icon><Plus /></el-icon>
            新增子菜单
          </el-button>
          <el-button type="success" @click="editMenu" :disabled="!selectedMenu">
            <el-icon><Edit /></el-icon>
            编辑
          </el-button>
          <el-button type="danger" @click="deleteMenu" :disabled="!selectedMenu">
            <el-icon><Delete /></el-icon>
            删除
          </el-button>
        </div>
      </div>
      <div class="menu-content">
        <div class="menu-tree">
          <el-tree
            ref="menuTree"
            :data="menuData"
            node-key="id"
            default-expand-all
            highlight-current
            :props="defaultProps"
            @current-change="handleCurrentChange"
          >
            <template #default="{ node }">
              <el-icon v-if="node.meta && node.meta.icon">
                <component :is="node.meta.icon" />
              </el-icon>
              <span class="ml-2">{{ node.label }}</span>
            </template>
          </el-tree>
        </div>
        <div class="menu-form">
          <el-form :model="formData" label-width="100px">
            <el-form-item label="菜单名称">
              <el-input v-model="formData.name" placeholder="请输入菜单名称" />
            </el-form-item>
            <el-form-item label="菜单图标">
              <el-select v-model="formData.icon" placeholder="请选择菜单图标">
                <el-option label="首页" value="House" />
                <el-option label="系统管理" value="Setting" />
                <el-option label="用户管理" value="User" />
                <el-option label="角色管理" value="UserFilled" />
                <el-option label="菜单管理" value="Menu" />
              </el-select>
            </el-form-item>
            <el-form-item label="菜单路径">
              <el-input v-model="formData.path" placeholder="请输入菜单路径" />
            </el-form-item>
            <el-form-item label="组件路径">
              <el-input v-model="formData.component" placeholder="请输入组件路径" />
            </el-form-item>
            <el-form-item label="排序">
              <el-input-number v-model="formData.sort" :min="0" style="width: 100%" />
            </el-form-item>
            <el-form-item label="状态">
              <el-switch v-model="formData.status" active-value="1" inactive-value="0" />
            </el-form-item>
            <el-form-item label="是否可见">
              <el-switch v-model="formData.visible" active-value="1" inactive-value="0" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveMenu">保存</el-button>
              <el-button @click="resetForm">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { useThemeStore } from '../../store/modules/theme'
import { ref, onMounted } from 'vue'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const themeStore = useThemeStore()
const isDark = ref(themeStore.isDark)

const menuTree = ref(null)
const selectedMenu = ref(null)

const menuData = ref([
  {
    id: 1,
    label: '首页',
    path: '/home',
    component: 'Home.vue',
    meta: { icon: 'House' },
    sort: 1,
    status: '1',
    visible: '1',
    children: []
  },
  {
    id: 2,
    label: '系统管理',
    path: '/system',
    meta: { icon: 'Setting' },
    sort: 2,
    status: '1',
    visible: '1',
    children: [
      {
        id: 3,
        label: '用户管理',
        path: '/system/user',
        component: 'system/UserManage.vue',
        meta: { icon: 'User' },
        sort: 1,
        status: '1',
        visible: '1'
      },
      {
        id: 4,
        label: '角色管理',
        path: '/system/role',
        component: 'system/RoleManage.vue',
        meta: { icon: 'UserFilled' },
        sort: 2,
        status: '1',
        visible: '1'
      },
      {
        id: 5,
        label: '菜单管理',
        path: '/system/menu',
        component: 'system/MenuManage.vue',
        meta: { icon: 'Menu' },
        sort: 3,
        status: '1',
        visible: '1'
      }
    ]
  }
])

const defaultProps = {
  children: 'children',
  label: 'label'
}

const formData = ref({
  id: null,
  name: '',
  icon: '',
  path: '',
  component: '',
  sort: 0,
  status: '1',
  visible: '1',
  parentId: null
})

const handleCurrentChange = (data) => {
  selectedMenu.value = data
  if (data) {
    formData.value = {
      id: data.id,
      name: data.label,
      icon: data.meta?.icon || '',
      path: data.path || '',
      component: data.component || '',
      sort: data.sort || 0,
      status: data.status || '1',
      visible: data.visible || '1',
      parentId: data.parentId || null
    }
  }
}

const addMenu = () => {
  selectedMenu.value = null
  formData.value = {
    id: null,
    name: '',
    icon: '',
    path: '',
    component: '',
    sort: 0,
    status: '1',
    visible: '1',
    parentId: null
  }
}

const addSubMenu = () => {
  if (!selectedMenu.value) return
  formData.value = {
    id: null,
    name: '',
    icon: '',
    path: '',
    component: '',
    sort: 0,
    status: '1',
    visible: '1',
    parentId: selectedMenu.value.id
  }
}

const editMenu = () => {
  if (!selectedMenu.value) return
  ElMessage.info('请在右侧表单中编辑菜单信息')
}

const deleteMenu = () => {
  if (!selectedMenu.value) return
  ElMessage.success('删除成功')
}

const saveMenu = () => {
  if (!formData.value.name) {
    ElMessage.warning('请输入菜单名称')
    return
  }
  ElMessage.success('保存成功')
}

const resetForm = () => {
  if (selectedMenu.value) {
    handleCurrentChange(selectedMenu.value)
  } else {
    formData.value = {
      id: null,
      name: '',
      icon: '',
      path: '',
      component: '',
      sort: 0,
      status: '1',
      visible: '1',
      parentId: null
    }
  }
}

onMounted(() => {
  isDark.value = themeStore.isDark
})
</script>

<style scoped>
.menu-container {
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

.menu-container.dark .card-header h2 {
  color: #fff;
}

.button-group {
  display: flex;
  gap: 10px;
}

.menu-content {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 20px;
}

.menu-tree {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 10px;
  height: 600px;
  overflow-y: auto;
}

.menu-container.dark .menu-tree {
  border-color: #303030;
}

.menu-form {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 20px;
  height: 600px;
  overflow-y: auto;
}

.menu-container.dark .menu-form {
  border-color: #303030;
}
</style>