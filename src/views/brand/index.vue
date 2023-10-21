<template>
  <div class="app-container brand-list">
    <el-form :model="queryParams" ref="queryFormRef" :inline="true" v-show="showSearch">
      <el-form-item label="品牌ID" prop="brandId">
        <el-input
          v-model="queryParams.brandId"
          placeholder="请输入品牌ID"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="品牌名称" prop="brandName">
        <el-input
          v-model="queryParams.brandName"
          placeholder="请输入品牌名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="国家" prop="country">
        <el-input v-model="queryParams.country" placeholder="请输入国家" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="品牌负责人" prop="country">
        <el-select
          v-model="queryParams.responsibleUserId"
          filterable
          remote
          placeholder="请输入品牌负责人"
          remote-show-suffix
          :remote-method="handleSearchPurchaseUser"
          :loading="selectLoading"
        >
          <el-option
            v-for="item in purchaseUserSearchList"
            :key="item.userId"
            :label="item.nickName"
            :value="item.userId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker
          clearable
          v-model="queryParams.createTime"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="请选择创建时间"
        ></el-date-picker>
      </el-form-item>
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
      <el-table-column type="selection" width="55" />
      <el-table-column label="品牌ID" align="center" prop="brandId" />
      <el-table-column label="品牌名称" align="center" prop="brandName" />
      <el-table-column label="品牌logo" align="center" prop="logo">
        <template #default="scope">
          <img class="loge-image" :src="scope.row.logo || defaultLogo" alt="" />
        </template>
      </el-table-column>
      <el-table-column label="国家" align="center" prop="country" />
      <el-table-column label="品牌负责人" align="center" prop="responsibleUserName" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template v-slot="scope">
          <el-button size="small" type="primary" link icon="edit" @click="handleUpdate(scope.row)">修改</el-button>
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

    <!-- 添加或修改brand对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90">
        <el-form-item label="品牌名称" prop="brandName">
          <el-input v-model="form.brandName" placeholder="请输入品牌名称" />
        </el-form-item>
        <el-form-item label="品牌logo" prop="logo">
          <image-upload v-model="brandLogo" :limit="1" />
        </el-form-item>
        <el-form-item label="国家" prop="country">
          <el-input v-model="form.country" placeholder="请输入国家" />
        </el-form-item>
        <el-form-item label="品牌负责人" prop="responsibleUserName">
          <el-select
            v-model="form.responsibleUserId"
            filterable
            remote
            placeholder="请输入品牌负责人"
            remote-show-suffix
            :remote-method="handleSearchPurchaseUser"
            :loading="selectLoading"
          >
            <el-option
              v-for="item in purchaseUserSearchList"
              :key="item.userId"
              :label="item.nickName"
              :value="item.userId"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer flex-center">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <el-dialog title="批量分配负责人" v-model="responsibleOpen" width="500px" append-to-body>
      <el-form ref="responsibleFormRef" :model="responsibleForm" label-width="90">
        <el-form-item label="品牌负责人" prop="responsibleUserName">
          <el-select
            v-model="responsibleForm.responsibleUserId"
            filterable
            remote
            placeholder="请输入品牌负责人"
            remote-show-suffix
            :remote-method="handleSearchPurchaseUser"
            :loading="selectLoading"
          >
            <el-option
              v-for="item in purchaseUserSearchList"
              :key="item.userId"
              :label="item.nickName"
              :value="item.userId"
            />
          </el-select>
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
import { listBrand, getBrand, delBrand, addBrand, updateBrand, listBrandUpdate } from '@/api/purchase/brand'

import { SearchUser } from '@/api/purchase/list'

import defaultLogo from '@/assets/images/default.png'

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
const brandLogo = ref(null)
// 查询参数
const queryParams = ref({
  pageNum: 1,
  pageSize: 15,
  brandId: null,
  brandName: null,
  country: null,
  createTime: null,
})
// 表单参数
const form = ref({})
// 表单校验
const rules = {
  brandName: [{ required: true, message: '品牌名称不能为空', trigger: 'blur' }],
  updateTime: [{ required: true, message: '更新时间不能为空', trigger: 'blur' }],
  createTime: [{ required: true, message: '创建时间不能为空', trigger: 'blur' }],
}
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

// 搜索销售员

const selectLoading = ref(false)
// 搜索采购员
const purchaseUserSearchList = ref([])
function handleSearchPurchaseUser(userName) {
  if (userName) {
    selectLoading.value = true
    SearchUser({ purchaseNickName: userName }).then((response) => {
      selectLoading.value = false
      purchaseUserSearchList.value = response.rows.filter((item) => {
        return {
          label: item.nickName,
          velue: item.userId,
        }
      })
    })
  }
}
// 取消按钮
function cancel() {
  open.value = false
  reset()
}

// 表单重置
function reset() {
  form.value = {
    brandId: null,
    brandName: null,
    logo: null,
    country: null,
    updateTime: null,
    createTime: null,
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
  reset()
  open.value = true
  title.value = '添加品牌'
}
/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const brandId = row.brandId || ids.value
  getBrand(brandId).then((response) => {
    form.value = response.data
    open.value = true
    title.value = '修改brand'
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

/** 提交按钮 */
function submitForm() {
  proxy.$refs['formRef'].validate((valid) => {
    if (valid) {
      form.value.logo = brandLogo.value
      if (form.value.brandId != null) {
        updateBrand(form.value).then((response) => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addBrand(form.value).then((response) => {
          proxy.$modal.msgSuccess('新增成功')
          open.value = false
          getList()
        })
      }
    }
  })
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
