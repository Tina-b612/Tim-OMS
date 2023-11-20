<template>
  <el-dialog :title="title" v-model="open" width="500px" append-to-body class="modelDialog">
    <el-form ref="modelRef" :model="form" :rules="rules" label-width="120px">
      <el-form-item label="产品型号" prop="model">
        <el-select
          v-model="form.model"
          value-key="modelName"
          allow-create
          filterable
          default-first-option
          clearable
          remote
          placeholder="请输入产品型号"
          remote-show-suffix
          :remote-method="handleSearchModelList"
          :loading="selectLoading"
        >
          <el-option v-for="item in modelSearchList" :key="item.modelId" :label="item.modelName" :value="item" />
        </el-select>
      </el-form-item>
      <!-- <el-form-item label="产品型号" prop="modelName" v-if="userHasRole">
        <el-input type="text" v-model="form.modelName" />
      </el-form-item> -->
      <el-form-item label="产品描述" prop="productDescription">
        <el-input autosize type="textarea" v-model="form.productDescription" placeholder="请输入产品描述" />
      </el-form-item>
      <el-form-item label="数量" prop="quantity">
        <el-input-number v-model="form.quantity" :min="1" />
      </el-form-item>
      <el-form-item label="销售附件" prop="salesAttachmentList" v-hasRole="['sales', 'salesAdmin']">
        <el-upload
          v-model:file-list="form.salesAttachmentList"
          :action="base + '/system/info/add'"
          :limit="3"
          :headers="headers"
          accept=".bmp, .gif, .jpg, .jpeg, .png, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .html, .htm, .txt, .rar, .zip, .gz, .bz2, .mp4, .avi, .rmvb, .pdf"
          :on-success="handleUploadSuccess"
        >
          <el-button type="primary">上传附件</el-button>
        </el-upload>
      </el-form-item>
      <!-- 新增订单不展示 -->
      <div v-if="orderState && userHasRole">
        <el-form-item label="供应商" prop="supplier">
          <el-select
            v-model="form.supplier"
            value-key="supplierName"
            allow-create
            filterable
            default-first-option
            clearable
            remote
            placeholder="请输入供应商名称"
            remote-show-suffix
            :remote-method="handleSearchSupplierList"
            :loading="selectLoading"
          >
            <el-option
              v-for="item in supplierSearchList"
              :key="item.supplierId"
              :label="item.supplierName"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="采购价" prop="purchasePrice" style="width: 300px">
          <el-input
            v-model="form.purchasePrice"
            placeholder="请输入采购价"
            :formatter="(value) => `${value}`.replace(/^(\-)*(\d+)\.(\d{4}).*$/, '$1$2.$3')"
          >
            <template #append>元</template>
          </el-input>
        </el-form-item>
        <el-form-item label="建议售价" prop="referencePrice" style="width: 300px">
          <el-input
            v-model="form.referencePrice"
            placeholder="请输入建议售价"
            :formatter="(value) => `${value}`.replace(/^(\-)*(\d+)\.(\d{4}).*$/, '$1$2.$3')"
          >
            <template #append>元</template>
          </el-input>
        </el-form-item>
        <el-form-item label="修改货期" prop="deliveryTime" style="width: 300px">
          <el-input v-model="form.deliveryTime" placeholder="请输入修改货期">
            <template #append>天</template>
          </el-input>
        </el-form-item>
        <el-form-item label="采购附件" prop="purchaseAttachmentList">
          <el-upload
            v-model:file-list="form.purchaseAttachmentList"
            :action="base + '/system/info/add'"
            accept=".bmp, .gif, .jpg, .jpeg, .png, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .html, .htm, .txt, .rar, .zip, .gz, .bz2, .mp4, .avi, .rmvb, .pdf"
            :headers="headers"
          >
            <el-button type="primary">上传附件</el-button>
          </el-upload>
        </el-form-item>
      </div>
    </el-form>
    <div slot="footer" class="dialog-footer mt20">
      <el-button @click="cancel">取 消</el-button>
      <el-button type="primary" @click="submitForm">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script setup>
import { searchModel, searchSupplier } from '@/api/purchase/list'
import { reactive } from 'vue'
import { getToken } from '@/utils/auth'
const base = import.meta.env.VITE_APP_BASE_API
const headers = ref({ Authorization: 'Bearer ' + getToken() })
const props = defineProps({
  title: {
    type: String,
    default: '新增产品',
  },
  orderState: {
    type: Number,
    default: null,
  },
  product: {
    type: Object,
    default: () => {
      return {
        model: null, // 型号
        productDescription: '', // 产品描述
        quantity: 1, // 采购数量
        salesAttachmentList: [], //销售附件
        purchasePrice: null, // 采购价
        referencePrice: null, //建议售价
        purchaseAttachmentList: [], // 采购附件
        supplier: null, // 供应商
        deliveryTime: null, // 货期
      }
    },
  },
})
const emit = defineEmits(['editProduct'])
const { proxy } = getCurrentInstance()
const isSales = proxy.$auth.hasRoleOr('sales', 'salesAdmin')
const isPurchase = proxy.$auth.hasRoleOr('purchase', 'purchaseAdmin')
const isAdmin = proxy.$auth.hasRoleOr('admin')
const open = ref(false)
const data = reactive({
  // 表单参数
  form: {},
  // 表单校验
  rules: {
    model: [{ required: true, message: '请选择型号', trigger: 'change' }],
    quantity: [{ required: true, message: '请输入采购数量', trigger: 'change' }],
    supplier: [{ required: true, message: '请选择供应商', trigger: 'change' }],
    purchasePrice: [{ required: true, message: '请选择供应商', trigger: 'blur' }],
  },
})
const userHasRole = ref(false)
const { form, rules } = toRefs(data)
const productRow = ref(null)
const productIndex = ref(null)
// 显示弹框
function show(row, index) {
  userHasRole.value = proxy.$auth.hasRoleOr(['purchase', 'purchaseAdmin'])
  reset()
  if (row) {
    productRow.value = row
    productIndex.value = index
    modelSearchList.value.push(row.model)
    supplierSearchList.value.push(row.supplier)
    form.value = row
  }
  open.value = true
}

// brandList 搜索供应商
const selectLoading = ref(false)
const supplierSearchList = ref([])
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
const modelSearchList = ref([])
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

// 提交订单
function submitForm() {
  proxy.$refs['modelRef'].validate((valid) => {
    console.log('表单校验')
    console.log(valid)
    if (valid) {
      console.log('修改订单')
      if (productIndex) {
        emit('editProduct', form.value, productIndex)
      } else {
        emit('editProduct', form.value)
      }
      open.value = false
    }
  })
}
// 取消新增
function cancel() {
  reset()
  open.value = false
}
// 表单重置
function reset() {
  form.value = {
    model: null,
    modelName: '',
    modelId: '',
    productDescription: '',
    quantity: 1,
    salesAttachmentList: [],
    purchasePrice: null,
    referencePrice: null,
    purchaseAttachmentList: [],
    supplier: null,
    deliveryTime: null,
  }
  productRow.value = null
  productIndex.value = null
  proxy.resetForm('modelRef')

  modelSearchList.value = []
}
defineExpose({
  show,
})
</script>

<style lang="scss">
/* style */
.modelDialog {
  .timProductList {
    td.el-table__cell div {
      overflow: visible;
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: center;
    // align-items: end;
  }
}
</style>
