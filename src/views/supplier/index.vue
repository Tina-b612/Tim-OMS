<template>
  <div class="app-container supplier">
    <el-form :model="queryParams" ref="queryFormRef" :inline="true" v-show="showSearch">
      <el-form-item label="供应商" prop="supplierId">
        <simple-select
          v-model="queryParams.supplierId"
          :remoteFunction="searchSupplier"
          searchKey="supplierName"
          searchValue="supplierId"
          placeholder="请输入供应商名称"
        />
      </el-form-item>
      <el-form-item label="纳税人识别号" prop="supplierTaxId">
        <el-input
          v-model="queryParams.supplierTaxId"
          placeholder="请输入纳税人识别号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="联系电话" prop="supplierContactPhone">
        <el-input
          v-model="queryParams.supplierContactPhone"
          placeholder="请输入联系电话"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="品牌" prop="brandId">
        <simple-select
          v-model="queryParams.brandId"
          :remoteFunction="searchBrand"
          searchKey="brandName"
          searchValue="brandId"
          placeholder="请输入品牌名称"
        />
      </el-form-item>
      <el-form-item label="是否启用" prop="supplierEnable">
        <el-select v-model="queryParams.supplierEnable" placeholder="请选择是否启用">
          <el-option label="是" :value="1"></el-option>
          <el-option label="否" :value="0"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" @click="handleQuery">搜索</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="supplierList">
      <!-- <el-table-column type="selection" width="55" align="center" /> -->
      <el-table-column label="供应商名称" align="center" prop="supplierName" />
      <el-table-column label="纳税人识别号" align="center" prop="supplierTaxId" />
      <el-table-column label="联系电话" align="center" prop="supplierContactPhone" />
      <el-table-column label="可供品牌" align="center" prop="brandList">
        <template #default="scope">
          <div v-for="(item, index) in scope.row.brandList" :key="index">
            {{ item.brandName }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="是否启用" width="90">
        <template #default="scope">
          <el-switch
            size="small"
            v-model="scope.row.supplierEnable"
            :active-value="1"
            :inactive-value="0"
            @change="changeSwitch(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template v-slot="scope">
          <el-tooltip content="编辑" placement="top">
            <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"></el-button>
          </el-tooltip>
          <el-tooltip content="关联品牌" placement="top">
            <el-button link type="primary" icon="Switch" @click="changeBrandResponsibleUser(scope.row)"></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改供应商管理对话框 -->
    <editModel :title="title" ref="editModelRef" @submit="getList"></editModel>
    <!-- 分配 -->
    <transferModel ref="transferModelRef" :transferProps="transferProps" @submit="getList"></transferModel>
  </div>
</template>

<script setup>
import { listSupplier } from '@/api/supplier'
import { searchUser, searchSupplier, searchBrand } from '@/api/brand'
import SimpleSelect from '@/components/SimpleSelect'
import editModel from './editModel'
import transferModel from './transferModel'

const { proxy } = getCurrentInstance()
// 遮罩层
const loading = ref(true)
// 显示搜索条件
const showSearch = ref(true)
// 总条数
const total = ref(0)
// 供应商管理表格数据
const supplierList = ref([])
// 弹出层标题
const title = ref('')
// 是否显示弹出层
const open = ref(false)
// 查询参数
const queryParams = ref({
  pageNum: 1,
  pageSize: 15,
  supplierId: null,
  supplierName: null,
})
// 表单参数
const form = ref({})
// 表单校验
const rules = {
  supplierName: [{ required: true, message: '供应商名称不能为空', trigger: 'blur' }],
}
const transferProps = ref({})

onMounted(() => {
  getList()
})

/** 查询供应商管理列表 */
function getList() {
  loading.value = true
  listSupplier(queryParams.value).then((response) => {
    supplierList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

// 取消按钮
function cancel() {
  open.value = false
  reset()
}

// 表单重置
function reset() {
  form.value = {
    supplierId: null,
    supplierName: null,
  }
  proxy.resetForm('formRef')
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm('queryFormRef')
  handleQuery()
}
/** 新增按钮操作 */
function handleAdd() {
  title.value = '新增供应商'
  proxy.$refs.editModelRef.show()
}
/** 修改按钮操作 */
function handleUpdate(row) {
  title.value = '新增供应商'
  proxy.$refs.editModelRef.show({ ...row })
}
// 关联品牌
function changeBrandResponsibleUser(row) {
  transferProps.value = {
    title: '关联品牌',
    titles: ['待分配', '已关联品牌'],
    props: {
      key: 'brandId',
      label: 'brandName',
    },
    filterPlaceholder: '品牌名称',
    data: brandList,
  }
  proxy.$refs.transferModelRef.show({ ...row })
}
// 获取所有品牌
const brandList = ref([])
function getInfo() {
  searchBrand().then((response) => {
    brandList.value = response
  })
}
getInfo()
</script>
