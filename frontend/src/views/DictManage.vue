<template>
  <div class="dict-container" :class="{ dark: isDark }">
    <el-card>
      <div class="card-header">
        <h2>数据字典管理</h2>
        <el-button type="primary" @click="openAddDictDialog">
          <el-icon><Plus /></el-icon>
          新增字典项
        </el-button>
      </div>
      <div class="search-bar">
        <el-input
          v-model="searchForm.dictName"
          placeholder="请输入字典名称"
          style="width: 200px; margin-right: 10px"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-input
          v-model="searchForm.dictCode"
          placeholder="请输入字典编码"
          style="width: 200px; margin-right: 10px"
          clearable
        >
          <template #prefix>
            <el-icon><Tools /></el-icon>
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
        <el-table-column prop="dictName" label="字典名称" align="center" />
        <el-table-column prop="dictCode" label="字典编码" align="center" />
        <el-table-column prop="description" label="字典描述" align="center" />
        <el-table-column prop="status" label="状态" align="center">
          <template #default="scope">
            <el-switch v-model="scope.row.status" active-value="1" inactive-value="0" />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" align="center" />
        <el-table-column label="操作" align="center" width="300">
          <template #default="scope">
            <el-button size="small" @click="editDict(scope.row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button size="small" type="danger" @click="deleteDict(scope.row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
            <el-button size="small" type="success" @click="openDictValueDialog(scope.row)">
              <el-icon><List /></el-icon>
              配置字典值
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

    <!-- 添加/编辑字典项弹窗 -->
    <el-dialog v-model="dictDialogVisible" :title="dictDialogTitle" width="500px">
      <el-form :model="dictFormData" label-width="100px">
        <el-form-item label="字典名称">
          <el-input v-model="dictFormData.dictName" placeholder="请输入字典名称" />
        </el-form-item>
        <el-form-item label="字典编码">
          <el-input v-model="dictFormData.dictCode" placeholder="请输入字典编码（英文大写）" />
        </el-form-item>
        <el-form-item label="字典描述">
          <el-input v-model="dictFormData.description" placeholder="请输入字典描述" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="dictFormData.status" active-value="1" inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dictDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveDict">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 字典值配置弹窗 -->
    <el-dialog v-model="dictValueVisible" :title="`字典值配置 - ${currentDictName}`" width="700px">
      <div style="margin-bottom: 20px; text-align: right;">
        <el-button type="primary" size="small" @click="openAddDictValueDialog">
          <el-icon><Plus /></el-icon>
          新增字典值
        </el-button>
      </div>
      <el-table
        :data="currentDictValues"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="value" label="字典值" align="center" />
        <el-table-column prop="label" label="显示标签" align="center" />
        <el-table-column prop="sort" label="排序" align="center" />
        <el-table-column prop="status" label="状态" align="center">
          <template #default="scope">
            <el-tag type="success" v-if="scope.row.status === '1'">启用</el-tag>
            <el-tag type="danger" v-else>禁用</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="150">
          <template #default="scope">
            <el-button size="small" @click="editDictValue(scope.row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button size="small" type="danger" @click="deleteDictValue(scope.row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 添加/编辑字典值弹窗 -->
      <el-dialog v-model="dictValueFormVisible" :title="dictValueFormTitle" width="450px">
        <el-form :model="dictValueFormData" label-width="100px">
          <el-form-item label="字典值">
            <el-input v-model="dictValueFormData.value" placeholder="请输入字典值" />
          </el-form-item>
          <el-form-item label="显示标签">
            <el-input v-model="dictValueFormData.label" placeholder="请输入显示标签" />
          </el-form-item>
          <el-form-item label="排序">
            <el-input-number v-model="dictValueFormData.sort" :min="0" :max="999" />
          </el-form-item>
          <el-form-item label="状态">
            <el-switch v-model="dictValueFormData.status" active-value="1" inactive-value="0" />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dictValueFormVisible = false">取消</el-button>
            <el-button type="primary" @click="saveDictValue">保存</el-button>
          </span>
        </template>
      </el-dialog>
    </el-dialog>
  </div>
</template>

<script setup>
import { useThemeStore } from '../store/modules/theme'
import { ref, onMounted } from 'vue'
import { Plus, Search, Tools, Edit, Delete, List } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const themeStore = useThemeStore()
const isDark = ref(themeStore.isDark)

const dictDialogVisible = ref(false)
const dictValueVisible = ref(false)
const dictValueFormVisible = ref(false)
const dictDialogTitle = ref('新增字典项')
const dictValueFormTitle = ref('新增字典值')

const currentDictName = ref('')
const currentDictId = ref('')

const dictFormData = ref({
  id: '',
  dictName: '',
  dictCode: '',
  description: '',
  status: '1'
})

const dictValueFormData = ref({
  id: '',
  value: '',
  label: '',
  sort: 0,
  status: '1'
})

const searchForm = ref({
  dictName: '',
  dictCode: ''
})

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

const tableData = ref([
  { id: 1, dictName: '用户状态', dictCode: 'USER_STATUS', description: '系统用户状态枚举', status: '1', createTime: '2024-01-01 10:00:00' },
  { id: 2, dictName: '性别', dictCode: 'GENDER', description: '用户性别枚举', status: '1', createTime: '2024-01-02 10:00:00' },
  { id: 3, dictName: '部门类型', dictCode: 'DEPT_TYPE', description: '部门类型枚举', status: '1', createTime: '2024-01-03 10:00:00' }
])

const dictValuesMap = ref({
  1: [
    { id: 1, value: '0', label: '禁用', sort: 2, status: '1' },
    { id: 2, value: '1', label: '启用', sort: 1, status: '1' }
  ],
  2: [
    { id: 3, value: '0', label: '女', sort: 2, status: '1' },
    { id: 4, value: '1', label: '男', sort: 1, status: '1' },
    { id: 5, value: '2', label: '未知', sort: 3, status: '1' }
  ],
  3: [
    { id: 6, value: '1', label: '技术部门', sort: 1, status: '1' },
    { id: 7, value: '2', label: '业务部门', sort: 2, status: '1' },
    { id: 8, value: '3', label: '管理部门', sort: 3, status: '1' }
  ]
})

const currentDictValues = ref([])

const openAddDictDialog = () => {
  dictDialogTitle.value = '新增字典项'
  dictFormData.value = {
    id: '',
    dictName: '',
    dictCode: '',
    description: '',
    status: '1'
  }
  dictDialogVisible.value = true
}

const editDict = (row) => {
  dictDialogTitle.value = '编辑字典项'
  dictFormData.value = { ...row }
  dictDialogVisible.value = true
}

const deleteDict = (row) => {
  ElMessage.success('删除成功')
}

const openDictValueDialog = (row) => {
  currentDictName.value = row.dictName
  currentDictId.value = row.id
  currentDictValues.value = dictValuesMap.value[row.id] || []
  dictValueVisible.value = true
}

const openAddDictValueDialog = () => {
  dictValueFormTitle.value = '新增字典值'
  dictValueFormData.value = {
    id: '',
    value: '',
    label: '',
    sort: 0,
    status: '1'
  }
  dictValueFormVisible.value = true
}

const editDictValue = (row) => {
  dictValueFormTitle.value = '编辑字典值'
  dictValueFormData.value = { ...row }
  dictValueFormVisible.value = true
}

const deleteDictValue = (row) => {
  const index = currentDictValues.value.findIndex(item => item.id === row.id)
  if (index > -1) {
    currentDictValues.value.splice(index, 1)
    ElMessage.success('删除成功')
  }
}

const saveDict = () => {
  dictDialogVisible.value = false
  ElMessage.success('保存成功')
}

const saveDictValue = () => {
  if (dictValueFormData.value.id) {
    // 编辑
    const index = currentDictValues.value.findIndex(item => item.id === dictValueFormData.value.id)
    if (index > -1) {
      currentDictValues.value[index] = { ...dictValueFormData.value }
    }
  } else {
    // 新增
    const newId = Date.now()
    currentDictValues.value.push({ ...dictValueFormData.value, id: newId })
  }
  dictValueFormVisible.value = false
  ElMessage.success('保存成功')
}

const search = () => {
  ElMessage.info('查询成功')
}

const reset = () => {
  searchForm.value = {
    dictName: '',
    dictCode: ''
  }
}

const handleSizeChange = (val) => {
  pageSize.value = val
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}

onMounted(() => {
  // 初始化字典数据
})
</script>

<style scoped>
.dict-container {
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