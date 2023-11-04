<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryFormRef" :inline="true" v-show="showSearch">
      <el-form-item label="采购负责人" prop="inquiryPurchaseUserId">
        <simple-select
          v-model="queryParams.brandResponsibleUserId"
          :remoteFunction="searchUser"
          searchKey="nickName"
          searchValue="userId"
          placeholder="请输入采购负责人名称"
        />
      </el-form-item>
      <el-form-item label="销售负责人" prop="inquirySalesUserId">
        <simple-select
          v-model="queryParams.brandResponsibleUserId"
          :remoteFunction="searchUser"
          searchKey="nickName"
          searchValue="userId"
          placeholder="请输入采购负责人名称"
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
      <el-form-item label="询盘编号" prop="inquirySn">
        <el-input
          v-model="queryParams.inquirySn"
          placeholder="请输入询盘编号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="订单状态更新时间" prop="inquiryStateUpdateTime">
        <el-date-picker
          v-model="queryParams.inquiryStateUpdateTime"
          style="width: 240px"
          value-format="YYYY-MM-DD"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="订单创建时间" prop="inquiryCreateTime">
        <el-date-picker
          v-model="queryParams.inquiryCreateTime"
          style="width: 240px"
          value-format="YYYY-MM-DD"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" @click="handleQuery">搜索</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd">创建询盘</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="inquiryList">
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
        <!-- <template #default="scope">
          <el-switch
            size="small"
            v-model="scope.row.supplierEnable"
            :active-value="1"
            :inactive-value="0"
            @change="changeSwitch(scope.row)"
          />
        </template> -->
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
import { searchUser, searchSupplier, searchBrand } from '@/api/brand'
import { listInquiry, getInquiry, delInquiry, addInquiry, updateInquiry } from '@/api/inquiry'
import SimpleSelect from '@/components/SimpleSelect'
import editModel from './editModel'
import transferModel from './transferModel'
import { reactive } from 'vue'

const { proxy } = getCurrentInstance()
// 遮罩层
const loading = ref(true)
// 显示搜索条件
const showSearch = ref(true)
// 总条数
const total = ref(0)
// 供应商管理表格数据
const inquiryList = ref([])
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
  listInquiry(queryParams.value).then((response) => {
    inquiryList.value = response.rows
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
// getInfo()
</script>
