<template>
  <div class="app-container brand-list">
    <el-form :model="queryParams" ref="queryFormRef" :inline="true" v-show="showSearch">
      <el-form-item label="品牌名称" prop="brandName">
        <el-input
          v-model="queryParams.brandName"
          placeholder="请输入品牌名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="国家" prop="brandCountry">
        <el-input
          v-model="queryParams.brandCountry"
          placeholder="请输入国家"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="品牌负责人" prop="brandResponsibleUserId">
        <simple-select
          v-model="queryParams.brandResponsibleUserId"
          :remoteFunction="searchUser"
          searchKey="nickName"
          searchValue="userId"
          placeholder="请输入品牌负责人名称"
        />
      </el-form-item>
      <el-form-item label="供应商" prop="supplierId">
        <simple-select
          v-model="queryParams.supplierId"
          :remoteFunction="searchSupplier"
          searchKey="supplierName"
          searchValue="supplierId"
          placeholder="请输入供应商名称"
        />
      </el-form-item>
      <el-form-item label="是否启用" prop="brandEnable"></el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
        <el-button type="success" plain icon="UserFilled" @click="multipleBrandUpdate">批量分配负责人</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="brandList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="35" />
      <el-table-column label="品牌名称" width="120" align="center" prop="brandName" />
      <el-table-column label="品牌logo" width="120" align="center" prop="logo">
        <template #default="scope">
          <img class="loge-image" :src="scope.row.brandLogo || defaultLogo" alt="" />
        </template>
      </el-table-column>
      <el-table-column label="国家" width="120" align="center" prop="brandCountry" />
      <el-table-column label="品牌负责人" align="center" prop="brandResponsibleUserList">
        <template #default="scope">
          <div>
            <span v-for="(item, index) in scope.row.brandResponsibleUserList" :key="index">
              {{ item.nickName + '，' }}
            </span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="供应商" align="center" prop="brandSupplierList">
        <template #default="scope">
          <div>
            <span v-for="(item, index) in scope.row.brandSupplierList" :key="index">
              {{ item.supplierName + '，' }}
            </span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="是否启用" width="90">
        <template #default="scope">
          <el-switch v-model="scope.row.brandEnable" :active-value="1" :inactive-value="0" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100" align="center" class-name="small-padding fixed-width">
        <template v-slot="scope">
          <el-button size="small" type="primary" link icon="edit" @click="handleUpdate(scope.row)">编辑</el-button>
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

    <editBrandModel :title="title" ref="editBrandModelRef" @submit="getList"></editBrandModel>

    <!-- 批量分配负责人对话框 -->
    <el-dialog title="批量分配负责人" v-model="responsibleOpen" width="500px" append-to-body>
      <el-form ref="responsibleFormRef" :model="responsibleForm" label-width="90">
        <el-form-item label="品牌负责人" prop="responsibleUserName">
          <simple-select
            v-model="responsibleForm.responsibleUserId"
            :remoteFunction="searchUser"
            searchKey="nickName"
            searchValue="userId"
            placeholder="请输入品牌负责人名称"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer flex-center">
        <el-button type="primary" @click="responsibleSubmitForm">确 定</el-button>
        <el-button @click="responsibleCancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { listBrand, getBrand, listBrandUpdate, searchUser, searchSupplier } from '@/api/brand'

import defaultLogo from '@/assets/images/default.png'
import SimpleSelect from '@/components/SimpleSelect'
import editBrandModel from './editBrandModel.vue'

const { proxy } = getCurrentInstance()
// 遮罩层
const loading = ref(true)
const responsibleOpen = ref(false)
const responsibleForm = ref({})
// 显示搜索条件
const showSearch = ref(true)
// 总条数
const total = ref(0)
// 供应商管理表格数据
const brandList = ref([])
// 弹出层标题
const title = ref('')
// 是否显示弹出层
const open = ref(false)
// 查询参数
const queryParams = ref({
  pageNum: 1,
  pageSize: 15,
  brandId: null,
  brandName: null,
  brandCountry: null,
  createTime: null,
})
// 表单参数
const form = ref({})

const multipleSelection = ref([])

onMounted(() => {
  getList()
})

/** 查询brand列表 */
function getList() {
  loading.value = true
  listBrand(queryParams.value).then((response) => {
    brandList.value = response.rows
    total.value = response.total
    loading.value = false
  })
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
  title.value = '新增品牌'
  proxy.$refs.editBrandModelRef.show()
}
/** 修改按钮操作 */
function handleUpdate(row) {
  const brandId = row.brandId || ids.value
  getBrand(brandId).then((response) => {
    form.value = response.data
    open.value = true
    title.value = '编辑品牌'
  })
}

function handleSelectionChange(val) {
  multipleSelection.value = val
}

function multipleBrandUpdate() {
  if (multipleSelection.value.length) {
    responsibleOpen.value = true
  } else {
    proxy.$modal.msgError('请选择需分配的品牌')
  }
}

function responsibleSubmitForm() {
  proxy.$modal.confirm('确认要批量分配这些品牌吗？').then(() => {
    listBrandUpdate({
      timBrandList: multipleSelection.value,
      responsibleUserId: responsibleForm.value.responsibleUserId,
    }).then((res) => {
      proxy.$modal.msgSuccess('分配成功')
      responsibleOpen.value = false
      responsibleForm.value = {}
      getList()
    })
  })
}

function responsibleCancel() {
  responsibleOpen.value = false
  responsibleForm.value = {}
}
</script>
<style lang="scss">
.brand-list {
  .loge-image {
    width: 50px;
    // height: 50px;
  }
}
</style>
