<template>
  <el-table
    :data="localDataList"
    border
    class="timProductList"
    :header-cell-style="{ 'text-align': 'center' }"
    :cell-style="{ 'text-align': 'center' }"
    style="width: 100%"
  >
    <!-- <el-table-column type="selection" width="55" /> -->
    <el-table-column type="index" width="50" label="序号" />
    <el-table-column prop="modelName" label="型号">
      <template #default="scope">
        <el-input v-model="scope.row.model" placeholder="请输入产品型号"></el-input>
      </template>
    </el-table-column>
    <el-table-column prop="productDescription" label="产品描述" :show-overflow-tooltip="true">
      <template #default="scope">
        <el-input v-model="scope.row.productDescription" placeholder="请输入产品描述"></el-input>
      </template>
    </el-table-column>
    <el-table-column prop="quantity" label="数量">
      <template #default="scope">
        <el-input-number v-model="scope.row.quantity" :min="1"></el-input-number>
      </template>
    </el-table-column>
    <el-table-column prop="salesAttachmentList" label="销售附件">
      <template #default="scope">
        <el-upload
          v-model:file-list="scope.row.salesAttachmentList"
          :action="base + '/system/info/add'"
          :limit="3"
          :headers="headers"
          accept=".bmp, .gif, .jpg, .jpeg, .png, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .html, .htm, .txt, .rar, .zip, .gz, .bz2, .mp4, .avi, .rmvb, .pdf"
          :on-success="handleUploadSuccess"
        >
          <el-button type="primary">上传附件</el-button>
        </el-upload>
      </template>
    </el-table-column>
    <el-table-column
      v-if="orderState != 5 && orderState != 7"
      label="操作"
      align="center"
      class-name="small-padding fixed-width"
      width="80"
    >
      <template #default="scope">
        <!-- <el-tooltip content="编辑" placement="top" v-if="scope.row.roleId !== 1">
          <el-button link type="primary" icon="Edit" @click="handleEditProduct(scope.row, scope.$index)"></el-button>
        </el-tooltip> -->
        <el-tooltip content="删除" placement="top" v-if="scope.row.roleId !== 1">
          <el-button link type="primary" icon="Delete" @click="handleDeleteOrderItem(scope.$index)"></el-button>
        </el-tooltip>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { searchModel, searchSupplier } from '@/api/purchase/list'
import { reactive } from 'vue'
import { getToken } from '@/utils/auth'
const { proxy } = getCurrentInstance()
const base = import.meta.env.VITE_APP_BASE_API
const headers = ref({ Authorization: 'Bearer ' + getToken() })
const userHasRole = ref(false)
const selectLoading = ref(false)
const modelSearchList = ref([])
const supplierSearchList = ref([])
import { deepClone } from '@/utils/index'
// setup
const props = defineProps({
  originDataList: {
    type: Array,
  },
  orderState: {
    type: [Number, String],
  },
})

const defaulfItem = {
  model: null, // 型号
  productDescription: '', // 产品描述
  quantity: 1, // 采购数量
  salesAttachmentList: [], //销售附件
}

const localDataList = ref([defaulfItem])

watch(
  () => props.originDataList,
  (originDataList) => {
    if (originDataList) {
      console.log('编辑')
      console.log(originDataList)
      localDataList.value = deepClone(originDataList)
      for (let i = 0; i < originDataList.length; i++) {
        const item = originDataList[i]
        modelSearchList.value.push(item.model)
        supplierSearchList.value.push(item.supplier)
      }
    }
  }
)
watch(localDataList, (localDataList) => {
  console.log(localDataList)
})

// brandList 搜索供应商
function handleSearchSupplierList(supplierName) {
  if (supplierName) {
    selectLoading.value = true
    searchSupplier({ supplierName: supplierName }).then((response) => {
      selectLoading.value = false
      supplierSearchList.value = response
    })
  }
}

// 搜索型号
function handleSearchModelList(value) {
  if (value) {
    selectLoading.value = true
    searchModel({ modelName: value }).then((response) => {
      selectLoading.value = false
      modelSearchList.value = response.rows
    })
  }
}
// 上传成功
function handleUploadSuccess(res) {
  if (res.code === 500) {
    proxy.$modal.msgError(res.msg)
  }
}
</script>

<style>
/* style */
</style>
