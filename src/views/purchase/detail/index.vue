<template>
  <div class="common-layout purchase-order-detail">
    <el-container>
      <el-main>
        <div class="purchase-order-detail-header" v-if="form.purchaseId">
          <div class="desc">
            <dict-tag style="display: inline" :options="order_state" :value="form.orderState" />
            <span>采购单号: {{ form.purchaseSn }}</span>
            <span>销售负责人: {{ form.salesUserName }}</span>
            <span>采购负责人: {{ form.purchaseUserName || '未分配' }}</span>
            <span>当前状态等待时长: {{ timingTimeStr }}</span>
          </div>
          <div class="right">
            <div>
              <el-button type="primary" icon="Back" circle size="small"></el-button>
              <span style="margin: 0 5px">1/15</span>
              <el-button type="primary" icon="Right" circle size="small"></el-button>
            </div>
            <ChatDotSquare style="font-size: 30px; width: 1em; height: 1em; margin-left: 10px; color: #e6a23c" />
          </div>
        </div>
        <div>{{ curRoles }}</div>
        <el-form class="mt20" ref="orderRef" :model="form" :rules="rules" label-width="80px" :disabled="false">
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
              :disabled="orderState == 5 || orderState == 7"
            >
              <el-option v-for="item in brandSearchList" :key="item.brandId" :label="item.brandName" :value="item" />
            </el-select>
          </el-form-item>
          <el-form-item label="订单描述" prop="orderDescription">
            <el-input
              :rows="3"
              type="textarea"
              v-model="form.orderDescription"
              placeholder="请输入订单描述"
              :disabled="orderState == 5 || orderState == 7"
            />
          </el-form-item>
          <el-form-item label="产品型号" v-if="orderState != 5 && orderState != 7">
            <el-button type="success" @click="handleEditProduct()">新增产品</el-button>
          </el-form-item>
          <el-form-item prop="timProductList">
            <el-table :data="form.timProductList" border class="timProductList" style="width: 100%">
              <!-- <el-table-column type="selection" width="55" /> -->
              <el-table-column type="index" width="50" label="序号" />
              <el-table-column prop="modelName" label="型号"></el-table-column>
              <el-table-column
                prop="productDescription"
                label="产品描述"
                :show-overflow-tooltip="true"
              ></el-table-column>
              <el-table-column prop="quantity" label="数量"></el-table-column>
              <el-table-column prop="salesAttachmentList" label="销售附件">
                <template #default="scope">
                  <div v-for="item in scope.row.salesAttachmentList">
                    <el-link type="primary" :href="base + (item.response.filePath || item.response.pathName)">
                      {{ item.name }}
                    </el-link>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="supplierName" label="供应商" v-hasRole="['admin', 'purchase']"></el-table-column>
              <el-table-column prop="purchasePrice" label="采购价"></el-table-column>
              <el-table-column prop="referencePrice" label="建议售价"></el-table-column>
              <el-table-column prop="deliveryTime" label="产品货期"></el-table-column>
              <el-table-column prop="purchaseAttachmentList" label="采购附件" v-hasRole="['admin', 'purchase']">
                <template #default="scope">
                  <div v-for="item in scope.row.purchaseAttachmentList">
                    <el-link type="primary" :href="base + (item.response.filePath || item.response.pathName)">
                      {{ item.name }}
                    </el-link>
                  </div>
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
                  <el-tooltip content="编辑" placement="top" v-if="scope.row.roleId !== 1">
                    <el-button
                      link
                      type="primary"
                      icon="Edit"
                      @click="handleEditProduct(scope.row, scope.$index)"
                    ></el-button>
                  </el-tooltip>
                  <el-tooltip content="删除" placement="top" v-if="scope.row.roleId !== 1">
                    <el-button
                      link
                      type="primary"
                      icon="Delete"
                      @click="handleDeleteOrderItem(scope.$index)"
                    ></el-button>
                  </el-tooltip>
                </template>
              </el-table-column>
            </el-table>
          </el-form-item>
        </el-form>
        <el-row class="clearfix fr">
          <el-button v-show="[0, 6].includes(orderState)" type="primary" @click="submitForm(1)">发送询价</el-button>
          <el-button v-show="[0, 6].includes(orderState)" type="success" @click="submitForm(6)">保存草稿</el-button>
          <el-button
            v-show="[1, 2].includes(orderState)"
            v-hasRole="['admin', 'sales', 'purchase']"
            type="primary"
            @click="submitForm(orderState)"
          >
            修改询价
          </el-button>
          <el-button
            v-show="[2].includes(orderState)"
            v-hasRole="['admin', 'purchase']"
            type="primary"
            @click="submitForm(2)"
          >
            修改报价
          </el-button>
          <el-button
            v-show="[2].includes(orderState)"
            v-hasRole="['admin', 'sales']"
            type="success"
            @click="submitForm(3)"
          >
            确认下单
          </el-button>
          <el-button
            v-show="[1].includes(orderState)"
            v-hasRole="['admin', 'purchase']"
            type="success"
            @click="submitForm(2)"
          >
            确认报价
          </el-button>
          <el-button v-show="[3].includes(orderState)" v-hasRole="['admin']" type="primary" @click="submitForm(4)">
            已付款
          </el-button>
          <el-button v-show="[4].includes(orderState)" v-hasRole="['admin', 'sales']" type="primary" @click="confirm">
            已签收
          </el-button>
          <el-button v-show="[3].includes(orderState)" v-hasRole="['admin']" type="danger" @click="submitForm(2)">
            驳回订单
          </el-button>

          <el-button
            v-show="[1, 2, 6].includes(orderState)"
            v-hasRole="['admin', 'sales']"
            @click="cancel"
            type="danger"
          >
            取消订单
          </el-button>
          <!---->

          <!-- <el-button
            v-if="[7].includes(orderState)"
            type="primary"
            v-hasRole="['admin', 'sales']"
            @click="submitForm(6)"
          >
            退回草稿
          </el-button> -->
        </el-row>
      </el-main>
      <el-aside class="message-containar">
        <omsMessage></omsMessage>
      </el-aside>
    </el-container>
    <modelDialog ref="modelDialogRef" @editProduct="updateProduct" :orderState="orderState" />
  </div>
</template>

<script setup name="Detaile">
import { getOrder, addOrder, updateOrder, searchBrand, searchModel } from '@/api/purchase/list'
import { onBeforeMount, reactive } from 'vue'
import omsMessage from '../componments/omsMessage.vue'
import modelDialog from './modelDialog.vue'
import { deepClone } from '@/utils/index'
import useUserStore from '@/store/modules/user'
const { proxy } = getCurrentInstance()
const { order_state } = proxy.useDict('order_state')
const canChange = ref(false)
const orderState = ref(0)
const orderId = proxy.$route.query.id
const userHasRole = ref(false)
const curRoles = useUserStore().roles
const isSales = proxy.$auth.hasRole('sales')
const isPurchase = proxy.$auth.hasRole('purchase')
const isAdmin = proxy.$auth.hasRole('admin')
const timingTimeStr = ref('')
const base = import.meta.env.VITE_APP_BASE_API
const originForm = {
  brand: null,
  brandId: null,
  brandName: '',
  orderDescription: '订单描述',
  timProductList: [],
}
const data = reactive({
  // 表单参数
  form: JSON.parse(JSON.stringify(originForm)),
  valueRule: { required: true, message: '请选择型号', trigger: 'change' },
  // 表单校验
  rules: {
    brand: [{ required: true, message: '请选择品牌', trigger: 'change' }],
  },
  selectModel: {
    modelId: null,
    modelName: '',
  },
})

const { form, rules, valueRule } = toRefs(data)

onBeforeMount(() => {
  userHasRole.value = proxy.$auth.hasRoleOr(['admin', 'purchase'])
  if (orderId) {
    const route = Object.assign({}, proxy.$route, { title: '编辑采购单' })
    proxy.$tab.updatePage(route)
    getOrder(orderId).then((res) => {
      nextTick(() => {
        let data = res.data
        orderState.value = data.orderState
        canChange.value = proxy.$auth.hasRoleOr(['admin', 'common']) && [1, 2, 3, 4, 6, 7].includes(data.orderState)
        data.brand = {
          brandId: data.brandId,
          brandName: data.brandName,
        }
        brandSearchList.value.push(data.brand)
        if (data.timProductList) {
          data.timProductList = data.timProductList.map((item) => {
            item.salesAttachmentList = item.salesAttachmentList || []
            item.purchaseAttachmentList = item.purchaseAttachmentList || []
            item.model = {
              modelId: item.modelId,
              modelName: item.modelName,
            }
            item.supplier = {
              supplierId: item.supplierId,
              supplierName: item.supplierName,
            }
            return item
          })
        }
        nextTick(() => {
          form.value = data
          setInterval(() => {
            timingTimeStr.value = timingTime(form.value.orderStateUpdateTime)
          })
        })
      })
    })
  } else {
    const route = Object.assign({}, proxy.$route, { title: '新增采购单' })
    proxy.$tab.updatePage(route)
  }
})

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
  if (typeof value === 'string') {
    form.value.brandId = ''
    form.value.brandName = value
  } else {
    form.value.brandId = value.brandId
    form.value.brandName = value.brandName
  }
}
// 修改产品
function handleEditProduct(row, index) {
  if (row) {
    proxy.$refs.modelDialogRef.show({ ...row }, index)
  } else {
    proxy.$refs.modelDialogRef.show()
  }
}
// 更新产品
function updateProduct(product, index) {
  let newProdcut = deepClone(product)
  if (newProdcut.model.modelId) {
    newProdcut.modelName = newProdcut.model.modelName
    newProdcut.modelId = newProdcut.model.modelId
  } else {
    newProdcut.modelName = newProdcut.model
    newProdcut.model = {
      modelId: null,
      modelName: newProdcut.model,
    }
  }
  if (userHasRole.value) {
    if (newProdcut.supplier && newProdcut.supplier.supplierId) {
      newProdcut.supplierName = newProdcut.supplier.supplierName
      newProdcut.supplierId = newProdcut.supplier.supplierId
    } else {
      newProdcut.supplierName = newProdcut.supplier
      newProdcut.supplier = {
        supplierId: null,
        supplierName: newProdcut.supplier,
      }
    }
  }

  if (index.value !== null) {
    form.value.timProductList[index.value] = newProdcut
  } else {
    form.value.timProductList.push(newProdcut)
  }
  console.log(form.value.timProductList)
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
    .catch(() => {})
}
// 选择产品
// const selectionProduct = []
// function handleSelectionChange(val) {
//   console.log(val)
//   selectionProduct.value = val
// }
// 提交订单
function submitForm(orderState) {
  proxy.$refs['orderRef'].validate((valid) => {
    if (valid) {
      if (form.value.purchaseId != undefined) {
        if ((isPurchase && orderState === 2) || (isSales && orderState === 3)) {
          for (let index = 0; index < form.value.timProductList.length; index++) {
            const item = form.value.timProductList[index]
            if (!item.purchasePrice) {
              return proxy.$modal.msgError(`序号为${index + 1}的产品还未添加报价`)
            }
          }
        }
        if (orderState === 3) {
          // selectionProduct  多选下单
        }
        form.value.orderState = orderState
        updateOrder(form.value).then((response) => {
          // proxy.$modal.msgSuccess('修改成功')
          proxy.$tab.closeOpenPage({ path: '/purchase/list' })
        })
      } else {
        form.value.orderState = orderState
        addOrder(form.value).then((response) => {
          proxy.$modal.msgSuccess('新增成功')
          proxy.$tab.closeOpenPage({ path: '/purchase/list' })
        })
      }
    }
  })
}
// 取消新增
function cancel() {
  proxy.$modal
    .confirm('是否确认取消订单?')
    .then(function () {
      form.value.orderState = 7
      updateOrder(form.value).then((response) => {
        proxy.$modal.msgSuccess('取消成功')
        proxy.$tab.closeOpenPage({ path: '/purchase/list' })
      })
    })
    .catch(() => {})
}
// 确认收货
function confirm() {
  proxy.$modal
    .confirm('确认客户已签收货物吗？')
    .then(function () {
      form.value.orderState = 5
      updateOrder(form.value).then((response) => {
        // proxy.$modal.msgSuccess('取消成功')
        proxy.$tab.closeOpenPage({ path: '/purchase/list' })
      })
    })
    .catch(() => {})
}
// 表单重置
function reset() {
  brandSearchList.value = []
  // form.value = JSON.parse(JSON.stringify(originForm))
  proxy.$ref.modelDialogRef.resetFields()
  proxy.resetForm('modelDialogRef')
}
// 当前状态等待时长
function timingTime(start) {
  let startTime = new Date(start).getTime()
  let currentTime = new Date().getTime()
  let difference = currentTime - startTime
  let m = Math.floor(difference / 1000)
  let mm = m % 60 // 秒
  let f = Math.floor(m / 60)
  let ff = f % 60 // 分钟
  let s = Math.floor(f / 60) // 小时
  let ss = s % 24
  let day = Math.floor(s / 24) // 天数
  return day + '天' + ss + '时' + ff + '分' + mm + '秒'
}
</script>

<style lang="scss">
/* style */
.purchase-order-detail {
  .timProductList {
    .cell {
      padding: 0 4px;
    }
  }

  .table-clumn-number .cell {
    padding: 0;

    input {
      line-height: 80px;
      border: none;
    }
  }

  &-header {
    padding-bottom: 15px;
    line-height: 38px;
    border-bottom: 1px solid var(--el-border-color);
    font-size: 14px;
    display: flex;
    justify-content: space-between;

    .desc span {
      margin-left: 25px;

      &:first-child {
        margin: 0;
      }
    }

    .right {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .brand-name {
    padding: 20px;
    font-size: 15px;
    line-height: 24px;
  }

  .purchase-order {
    position: relative;
    padding: 20px;

    .pagination-container .el-pagination {
      right: 20px;
    }
  }

  .message-containar {
    width: 25%;
    max-width: 350px;
    flex-shrink: 0;
    // margin-left: 20px;
    box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.12);
    background: #fff;
    padding: 0;
  }
}
</style>
