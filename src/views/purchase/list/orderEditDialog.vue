<template>
  <el-dialog :title="title" v-model="open" width="1450px" append-to-body class="orderEditDialog">
    <el-form ref="orderRef" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="品牌" prop="brand" width="600px">
        <el-select
          v-model="form.brand"
          value-key="brandName"
          allow-create
          filterable
          default-first-option
          clearable
          remote
          placeholder="请输入品牌名称"
          remote-show-suffix
          :remote-method="handleSearchBrandList"
          @change="brandSelectChange"
          :loading="selectLoading"
        >
          <el-option v-for="item in brandSearchList" :key="item.brandId" :label="item.brandName" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item label="订单描述" prop="orderDescription">
        <el-input :rows="3" type="textarea" v-model="form.orderDescription" placeholder="请输入订单描述" />
      </el-form-item>

      <el-form-item prop="timProductList">
        <el-table :data="form.timProductList" border class="timProductList" style="width: 100%">
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="timProductList.model" label="型号" width="200">
            <template #default="scope">
              <el-form-item :prop="'timProductList.' + scope.$index + '.model'" :rules="valueRule">
                <el-select
                  v-model="scope.row.model"
                  value-key="modelName"
                  allow-create
                  filterable
                  default-first-option
                  no-data-text
                  clearable
                  remote
                  placeholder="请输入型号名称"
                  remote-show-suffix
                  :remote-method="handleSearchModelList"
                  @change="
                    (val) => {
                      modelSelectChange(val, scope.row)
                    }
                  "
                  :loading="selectLoading"
                >
                  <el-option
                    v-for="item in modelSearchList"
                    :key="item.modelId"
                    :label="item.modelName"
                    :value="item"
                  />
                </el-select>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column prop="orderNumber" label="订货号" width="200">
            <template #default="scope">
              <el-input v-model="scope.row.orderNumber" placeholder="请输入订货号" />
            </template>
          </el-table-column>
          <el-table-column prop="productDescription" label="产品描述">
            <template #default="scope">
              <el-input :rows="3" type="textarea" v-model="scope.row.productDescription" placeholder="请输入产品描述" />
            </template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="180">
            <template #default="scope">
              <el-input-number v-model="scope.row.quantity" :min="1" :max="10" />
            </template>
          </el-table-column>
          <el-table-column prop="salesAttachmentList" align="“center" label="附件" width="300">
            <template #default="scope">
              <el-upload
                v-model:file-list="scope.row.salesAttachmentList"
                :action="base + '/system/info/add'"
                :limit="3"
                :headers="headers"
              >
                <el-button type="primary">上传附件</el-button>
              </el-upload>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="80">
            <template #default="scope">
              <el-tooltip content="删除" placement="top" v-if="scope.row.roleId !== 1">
                <el-button link type="primary" icon="Delete" @click="handleDeleteOrderItem(scope.$index)"></el-button>
              </el-tooltip>
              <el-tooltip content="添加" placement="top" v-if="scope.row.roleId !== 1">
                <el-button link type="primary" icon="Plus" @click="handleAddOrderItem()"></el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer mt20">
      <el-button @click="cancel">取 消</el-button>
      <el-button type="success" @click="submitForm(6)">保存草稿</el-button>
      <el-button type="primary" @click="submitForm(1)">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script setup>
import { getOrder, addOrder, updateOrder, searchBrand, searchModel } from '@/api/purchase/list'
import { reactive } from 'vue'
import { getToken } from '@/utils/auth'
const base = import.meta.env.VITE_APP_BASE_API
const headers = ref({ Authorization: 'Bearer ' + getToken() })
const props = defineProps({
  // modelValue: [String, Object, Array],
  title: {
    type: String,
    default: '新增订单',
  },
  OrderId: {
    type: Number,
    default: null,
  },
})
const emit = defineEmits(['ok'])
const { proxy } = getCurrentInstance()
const open = ref(false)
const originForm = {
  brand: null,
  brandId: null,
  brandName: '',
  orderDescription: '订单描述',
  timProductList: [
    {
      model: null,
      modelId: null,
      modelName: '',
      orderNumber: '',
      productDescription: '',
      quantity: 1,
      salesAttachmentList: [],
    },
  ],
}
const data = reactive({
  // 表单参数
  form: JSON.parse(JSON.stringify(originForm)),
  valueRule: { required: true, message: '请选择型号', trigger: 'change' },
  // 表单校验
  rules: {
    brand: [{ required: true, message: '请选择品牌', trigger: 'change' }],
  },
})

const { form, rules, valueRule } = toRefs(data)

// 显示弹框
function show(orderId) {
  reset()
  if (orderId) {
    getOrder(orderId).then((res) => {
      let data = res.data
      brandSearchList.value.push(data.brand)
      // for (let i = 0; i < data.timProductList.length; i++) {
      //   const item = data.timProductList[i];
      //   modelSearchList.value.push(item.model)
      // }
      data.timProductList = data.timProductList.map((item) => {
        modelSearchList.value.push(item.model)
        item.salesAttachmentList = item.salesAttachmentList || []
        return item
      })
      form.value = data
      open.value = true
    })
  } else {
    open.value = true
  }
}

// brandList 搜索品牌
const selectLoading = ref(false)
const brandSearchList = ref([])
function handleSearchBrandList(brandName) {
  if (brandName) {
    selectLoading.value = true
    searchBrand({ brandName: brandName }).then((response) => {
      selectLoading.value = false
      brandSearchList.value = response.rows
    })
  }
}
// 选择品牌
function brandSelectChange(value) {
  console.log(value)
  if (typeof value === 'string') {
    form.value.brandId = ''
    form.value.brandName = value
  } else {
    form.value.brandId = value.brandId
    form.value.brandName = value.brandName
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
// 选择型号
function modelSelectChange(value, row) {
  if (typeof value === 'string') {
    row.modelId = ''
    row.modelName = value
  } else {
    row.modelId = value.modelId
    row.modelName = value.modelName
  }
}

//添加型号
function handleAddOrderItem() {
  const obj = {
    model: null,
    modelName: '',
    modelId: '',
    orderNumber: '',
    productDescription: '',
    quantity: 1,
    salesAttachmentList: [],
  }
  form.value.timProductList.push(obj)
}
//删除型号
function handleDeleteOrderItem(index) {
  proxy.$modal
    .confirm('是否确认删除序号为"' + (index + 1) + '"产品?')
    .then(function () {
      form.value.timProductList.splice(index, 1)
    })
    .then(() => {
      proxy.$modal.msgSuccess('删除成功')
    })
}
// 提交订单
function submitForm(orderState) {
  proxy.$refs['orderRef'].validate((valid) => {
    if (valid) {
      if (form.value.purchaseId != undefined) {
        updateOrder(form.value).then((response) => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          reset()
          emit('ok')
        })
      } else {
        form.value.orderState = orderState
        addOrder(form.value).then((response) => {
          proxy.$modal.msgSuccess('新增成功')
          open.value = false
          reset()
          emit('ok')
        })
      }
    }
  })
}
// 取消新增
function cancel() {
  open.value = false
  reset()
}
// 表单重置
function reset() {
  brandSearchList.value = []
  modelSearchList.value = []
  form.value = JSON.parse(JSON.stringify(originForm))
  proxy.resetForm('orderRef')
}
defineExpose({
  show,
})
</script>

<style lang="scss">
/* style */
.orderEditDialog {
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
