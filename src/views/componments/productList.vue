<template>
  <el-table
    ref="productListRef"
    :data="productList"
    border
    class="productList"
    :header-cell-style="{ 'text-align': 'center' }"
    :cell-style="{ 'text-align': 'center' }"
    style="width: 100%"
    @selection-change="handleSelectionChange"
  >
    <el-table-column type="selection" width="55" />
    <el-table-column prop="productName" label="型号" fixed="left" :width="extroProps.pageEdit ? 150 : 'auto'">
      <template #default="scope">
        <el-form-item :prop="'productList.' + scope.$index + '.productName'" :rules="valueRule">
          <el-input
            v-model="scope.row.productName"
            placeholder="请输入产品型号"
            v-if="scope.row.edit || status === 0"
          ></el-input>
          <span v-else>{{ scope.row.productName }}</span>
        </el-form-item>
      </template>
    </el-table-column>
    <el-table-column
      prop="productDescription"
      label="产品描述"
      :show-overflow-tooltip="true"
      :width="proxy.$auth.hasRoleOr(['purchase', 'purchaseAdmin']) && extroProps.pageEdit ? 160 : 'auto'"
    >
      <template #default="scope">
        <el-input
          v-model="scope.row.productDescription"
          placeholder="请输入产品描述"
          v-if="scope.row.edit || status === 0"
        ></el-input>
        <span v-else>{{ scope.row.productDescription }}</span>
      </template>
    </el-table-column>
    <el-table-column
      prop="productQuantity"
      label="数量"
      :width="proxy.$auth.hasRoleOr(['purchase', 'purchaseAdmin']) && extroProps.pageEdit ? 160 : 'auto'"
    >
      <template #default="scope">
        <el-input-number
          v-model="scope.row.productQuantity"
          :controls="false"
          :precision="0"
          :min="1"
          v-if="scope.row.edit || status === 0"
          @change="getPurchaseTotalPrice(scope.row)"
        ></el-input-number>
        <span v-else>{{ scope.row.productQuantity }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="salesFileList" label="销售附件" width="150">
      <template #default="scope">
        <el-upload
          v-if="scope.row.edit || status === 0"
          v-model:file-list="scope.row.salesFileList"
          :action="base + '/system/info/add'"
          :limit="3"
          :headers="headers"
          accept=".jpg, .jpeg, .png, .doc, .docx, .xls, .xlsx, .pdf"
          :on-success="handleUploadSuccess"
          :on-preview="handleFilePreview"
        >
          <!-- <el-button type="primary" :disabled="!scope.row.edit">上传附件</el-button> -->
          <el-icon><Plus /></el-icon>
        </el-upload>
        <div v-else v-for="item in scope.row.salesFileList" class="link-type text-overflow fs12">
          <a :href="item.url" target="_blank" rel="noopener noreferrer">{{ item.fileName }}</a>
        </div>
      </template>
    </el-table-column>
    <el-table-column prop="supplier" label="供应商" width="150" v-hasRole="['purchase', 'purchaseAdmin']">
      <template #default="scope">
        <el-form-item :prop="'productList.' + scope.$index + '.supplier'" :rules="valueRule">
          <simple-select
            v-if="status < 3 || scope.row.edit"
            v-model="scope.row.supplier"
            :defaultList="[scope.row.supplier]"
            :remoteFunction="searchSupplier"
            searchKey="supplierName"
            searchValue="supplierId"
          />
          <span v-else>{{ scope.row.supplierName }}</span>
        </el-form-item>
      </template>
    </el-table-column>
    <el-table-column
      prop="productPurchaseMethod"
      label="采购方式"
      v-if="status >= 3 || proxy.$auth.hasRoleOr(['purchase', 'purchaseAdmin'])"
      width="100"
    >
      <template #default="scope">
        <el-form-item
          v-if="status < 3 || scope.row.edit"
          :prop="'productList.' + scope.$index + '.productPurchaseMethod'"
          :rules="valueRule"
        >
          <el-input v-model="scope.row.productPurchaseMethod"></el-input>
        </el-form-item>
        <span v-else>{{ scope.row.productPurchaseMethod }}</span>
      </template>
    </el-table-column>
    <el-table-column
      prop="productPurchasePrice"
      label="未税单价"
      v-if="status >= 3 || proxy.$auth.hasRoleOr(['purchase', 'purchaseAdmin'])"
      width="100"
    >
      <template #default="scope">
        <el-form-item :prop="'productList.' + scope.$index + '.productPurchasePrice'" :rules="valueRule">
          <el-input-number
            v-if="status < 3 || scope.row.edit"
            v-model="scope.row.productPurchasePrice"
            :controls="false"
            :precision="4"
            @change="getPurchaseTotalPrice(scope.row)"
          ></el-input-number>
          <span v-else>{{ scope.row.productPurchasePrice }}</span>
        </el-form-item>
      </template>
    </el-table-column>
    <el-table-column
      prop="productReferencePrice"
      label="建议售价"
      v-if="status >= 3 || proxy.$auth.hasRoleOr(['purchase', 'purchaseAdmin'])"
      width="100"
    >
      <template #default="scope">
        <el-form-item>
          <el-input-number
            v-if="status < 3 || scope.row.edit"
            v-model="scope.row.productReferencePrice"
            :controls="false"
            :precision="4"
          ></el-input-number>
          <span v-else>{{ scope.row.productReferencePrice }}</span>
        </el-form-item>
      </template>
    </el-table-column>
    <el-table-column
      prop="productPurchaseTotalPrice"
      label="采购总价"
      v-if="status >= 3 || proxy.$auth.hasRoleOr(['purchase', 'purchaseAdmin'])"
      width="100"
    ></el-table-column>
    <el-table-column
      prop="productDeliveryTime"
      label="预计货期"
      v-if="status >= 3 || proxy.$auth.hasRoleOr(['purchase', 'purchaseAdmin'])"
      width="100"
    >
      <template #default="scope">
        <el-form-item>
          <el-input v-if="status < 3 || scope.row.edit" v-model="scope.row.productDeliveryTime"></el-input>
          <span v-else>{{ scope.row.productDeliveryTime }}</span>
        </el-form-item>
      </template>
    </el-table-column>
    <el-table-column
      prop="purchaseFileList"
      label="采购附件"
      v-if="status >= 3 || proxy.$auth.hasRoleOr(['purchase', 'purchaseAdmin'])"
      width="150"
    >
      <template #default="scope">
        <el-upload
          v-if="status < 3 || scope.row.edit"
          v-model:file-list="scope.row.purchaseFileList"
          :action="base + '/system/info/add'"
          :limit="3"
          :headers="headers"
          accept=".jpg, .jpeg, .png, .doc, .docx, .xls, .xlsx, .pdf"
          :on-success="handleUploadSuccess"
          :on-preview="handleFilePreview"
          :before-remove="handleFileRemove"
        >
          <el-icon><Plus /></el-icon>
        </el-upload>
        <div v-else>
          <div v-for="item in scope.row.purchaseFileList" class="link-type text-overflow fs12">
            <!-- {{ item.fileName }} -->
            <a :href="item.url" target="_blank" rel="noopener noreferrer">{{ item.fileName }}</a>
          </div>
        </div>
      </template>
    </el-table-column>
    <el-table-column label="产品状态" prop="productType" v-if="status >= 3">
      <template #default="scope">
        <dict-tag style="display: inline" :options="product_status" :value="scope.row.productType" />
      </template>
    </el-table-column>
    <el-table-column
      label="操作"
      align="center"
      width="150"
      fixed="right"
      v-if="(status === 3 && proxy.$auth.hasRoleOr(['purchase', 'purchaseAdmin'])) || [0, 1, 2].includes(status)"
    >
      <template #default="scope">
        <el-popover
          placement="top"
          title="历史成交价"
          width="800"
          trigger="click"
          v-if="scope.row.productId && ![0].includes(status) && proxy.$auth.hasRoleOr(['purchase', 'purchaseAdmin'])"
        >
          <template #reference>
            <!-- <el-button
                            link
                            type="primary"
                            icon="Clock"
                            :disabled="!scope.row.btnEdit"
                            @click="getHistory(scope.row)"
                          ></el-button> -->
            <span class="mr15">
              <el-tooltip content="历史报价" placement="top">
                <el-button
                  link
                  type="primary"
                  icon="Clock"
                  :disabled="!extroProps.pageEdit || !scope.row.btnEdit"
                  @click="getHistory(scope.row)"
                ></el-button>
              </el-tooltip>
            </span>
          </template>
          <el-table
            :data="historyList"
            :header-cell-style="{ 'text-align': 'center' }"
            :cell-style="{ 'text-align': 'center' }"
          >
            <el-table-column width="120" property="supplierName" label="供应商名称" />
            <el-table-column property="productPurchasePrice" label="金额" />
            <el-table-column property="productReferencePrice" label="建议售价" />
            <el-table-column property="productDeliveryTime" label="预计货期" />
            <el-table-column property="productPurchaseMethod" label="付款方式" />
            <el-table-column width="300" property="productUpdateTime" label="报价时间" />
          </el-table>
        </el-popover>
        <el-tooltip content="编辑" placement="top" v-if="scope.row.productId && ![0].includes(status)">
          <el-button
            link
            type="primary"
            icon="Edit"
            :disabled="!extroProps.pageEdit || !scope.row.btnEdit"
            @click="handleEditProduct(scope.$index)"
          ></el-button>
        </el-tooltip>
        <el-tooltip content="复制" placement="top" v-if="scope.row.productId && ![0].includes(status)">
          <el-button
            link
            type="primary"
            icon="CopyDocument"
            :disabled="!extroProps.pageEdit || !scope.row.btnEdit"
            @click="handleEditProduct(scope.$index)"
          ></el-button>
        </el-tooltip>
        <el-tooltip content="保存" placement="top" v-if="scope.row.productId && ![0].includes(status)">
          <el-button
            link
            type="primary"
            icon="CircleCheck"
            :disabled="!extroProps.pageEdit || !scope.row.btnEdit"
            @click="handleSave(scope.$index)"
          ></el-button>
        </el-tooltip>

        <el-tooltip content="删除" placement="top" v-if="[0].includes(status)">
          <el-button
            link
            type="primary"
            icon="Delete"
            @click="handleDeleteOrderItem(scope.row, scope.$index)"
          ></el-button>
        </el-tooltip>
        <el-tooltip content="删除" placement="top" v-else>
          <el-button
            link
            type="primary"
            icon="Delete"
            :disabled="!extroProps.pageEdit || !scope.row.btnEdit"
            @click="handleDeleteOrderItem(scope.row, scope.$index)"
          ></el-button>
        </el-tooltip>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
// setup
import { getInquiry, updateInquiry, editInquiryStatus, quotedHistory } from '@/api/inquiry'
import { searchSupplier } from '@/api/brand'
import { delFile } from '@/api/system/info'
import { delProduct } from '@/api/product'
import SimpleSelect from '@/components/SimpleSelect'
import { onBeforeMount, ref, watch } from 'vue'
import { getToken } from '@/utils/auth'
import { deepClone } from '@/utils/index'
const { proxy } = getCurrentInstance()
const { product_status } = proxy.useDict('product_status')
const base = import.meta.env.VITE_APP_BASE_API
const headers = ref({ Authorization: 'Bearer ' + getToken() })
const updatedProductId = ref(null)
const btnAddDiabled = ref(false)
const productList = ref([])

const props = defineProps({
  data: Array,
  extroProps: Object,
  handelMethod: Object,
  status: Number || String,
})

onBeforeMount(() => {
  console.log(props)
  productList.value = deepClone(props.data)
})

watch(
  () => props.data,
  (val) => {
    if (val) {
      productList.value = val
    }
  },
  { deep: true, immediate: true }
)

// 产品默认对象
const defaulfItem = {
  edit: true,
  btnEdit: true,
  productName: null, // 型号
  productDescription: '', // 产品描述
  productQuantity: 1, // 采购数量
  salesFileList: [], //销售附件
}

const data = reactive({
  valueRule: { required: true, message: '请输入', trigger: 'change' },
  // 表单校验
  rules: {
    rtBrand: [{ required: true, message: '请选择品牌', trigger: 'change' }],
  },
})
const { rules, valueRule } = toRefs(data)

// 选择产品
const multipleSelection = ref([])
function handleSelectionChange(val) {
  // console.log(val)
  multipleSelection.value = val
  let price = 0
  let count = 0
  for (let i = 0; i < val.length; i++) {
    const item = val[i]
    price += item.productPurchaseTotalPrice * 1
    count += item.productQuantity * 1
  }
  form.value.inquirySelectedTotalPriceNoTax = getFloat(price, 4)
  // 税金
  form.value.inquirySelectedTax = getFloat(
    (form.value.inquirySelectedTotalPriceNoTax * form.value.inquiryTaxRate) / 100,
    4
  )
  // 总价
  let TotalPrice
  if (val.length) {
    TotalPrice = form.value.inquirySelectedTotalPriceNoTax * 1 + form.value.inquiryOtherFee * 1
  } else {
    TotalPrice = form.value.inquirySelectedTotalPriceNoTax * 1
  }
  form.value.inquirySelectedTotalPrice = getFloat(TotalPrice, 4)
  form.value.inquirySelectedCount = val.length
  form.value.inquirySelectedTotalProducts = count
}

// 获取历史成交价
const historyList = ref([])
function getHistory(row) {
  quotedHistory(row.productId).then((res) => {
    historyList.value = res.data
  })
}

// 上传成功
function handleUploadSuccess(res) {
  if (res.code === 500) {
    proxy.$modal.msgError(res.msg)
  }
}

// 预览文件
function handleFilePreview(uploadFile) {
  window.open(uploadFile.url)
}

// 删除文件
function handleFileRemove(uploadFile) {
  return proxy.$modal
    .confirm('当前操作不可恢复，是否确认删除附件： ' + uploadFile.name)
    .then(function () {
      delFile(uploadFile.fileId).then((res) => {
        proxy.$modal.msgSuccess('删除成功')
        return true
      })
    })
    .catch(() => false)
}

// 编辑产品
function handleEditProduct(index) {
  updatedProductId.value = productList.value[index].productId
  for (let i = 0; i < productList.value.length; i++) {
    const product = productList.value[i]
    if (i === index) {
      product.edit = true
    }
    product.btnEdit = false
    btnAddDiabled.value = true
  }
}

// 删除产品
function handleDeleteOrderItem(item, index) {
  console.log(item)
  proxy.$modal.confirm('当前操作不可恢复，是否确认删除本产品？').then(function () {
    if (item.productId) {
      delProduct(item.productId).then((res) => {
        proxy.$modal.msgSuccess('删除成功')
        getInfo()
      })
    } else {
      productList.value.splice(index, 1)
      proxy.$modal.msgSuccess('删除成功')
    }
  })
}

// 添加产品
function handleAddProduct() {
  productList.value.push(deepClone(defaulfItem))
  productList.value = productList.value.map((item) => {
    if (item.productId) {
      item.btnEdit = false
    }
    return item
  })
}
</script>

<style>
/* style */
</style>
