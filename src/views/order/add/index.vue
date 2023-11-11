<template>
  <div class="common-layout add-order-detail">
    <el-container>
      <el-main class="purchase-order-main">
        <!-- 订单操作按钮 -->
        <el-row class="flex-center-right mt20">
          <!-- 默认状态按钮 -->
          <div class="right">
            <el-button type="success" @click="submitForm(0)">保存为草稿</el-button>
            <el-button type="success" @click="submitForm(1)">申请采购</el-button>
          </div>
        </el-row>
        <el-form ref="orderRef" :model="form" :rules="rules" label-width="80px" :disabled="false" class="orderForm">
          <div class="mt20">
            <el-form-item label="品牌" prop="rtBrand" width="600px">
              <brandSelect v-model="form.rtBrand" :brandEnable="1"></brandSelect>
            </el-form-item>
            <el-form-item label="订单描述" prop="orderDescription">
              <el-input :rows="3" type="textarea" v-model="form.orderDescription" placeholder="请输入订单描述" />
            </el-form-item>
            <el-form-item class="mt20" label="PI号" prop="piSn">
              <el-input v-model="form.piSn" placeholder="请输入PI号" />
            </el-form-item>
          </div>

          <!-- 合计 -->
          <el-row :gutter="20" justify="center">
            <el-col :span="12" class="total-price-left">
              <el-card class="total-price-content">
                <h3 class="ml20">本单合计</h3>
                <div class="flex-center-left ml20 totalPrice">
                  <div>未税总价：¥ {{ form.orderTotalPriceNoTax || 0 }}</div>
                  <div class="ml20">税金：¥ {{ form.orderTax || 0 }}</div>
                  <div class="ml20">总价：¥ {{ form.orderTotalPrice || 0 }}</div>
                </div>
                <div class="flex-center-left mt10">
                  <el-form-item label="税率" prop="orderTaxRate">
                    <template #label>
                      税率
                      <el-popover
                        placement="top"
                        :width="200"
                        effect="dark"
                        trigger="hover"
                        content="未税为0或者含税的税点"
                      >
                        <template #reference>
                          <el-icon style="display: inline-block; line-height: 36px; cursor: pointer">
                            <Warning />
                          </el-icon>
                        </template>
                      </el-popover>
                      :
                    </template>

                    <el-input v-model="form.orderTaxRate" style="width: 130px" @input="getTotalPrice">
                      <template #append>%</template>
                    </el-input>
                  </el-form-item>
                  <el-form-item label="杂费" prop="orderOtherFee">
                    <template #label>
                      杂费
                      <el-popover
                        placement="top"
                        :width="200"
                        effect="dark"
                        trigger="hover"
                        content="包装费、税费、附加费等合计"
                      >
                        <template #reference>
                          <el-icon style="display: inline-block; line-height: 36px; cursor: pointer">
                            <Warning />
                          </el-icon>
                        </template>
                      </el-popover>
                      :
                    </template>
                    <el-input v-model="form.orderOtherFee" style="width: 150px" @input="getTotalPrice">
                      <template #append>元</template>
                    </el-input>
                  </el-form-item>
                </div>
              </el-card>
            </el-col>
          </el-row>
          <div class="mt20">
            <el-form-item lable="产品明细">
              <el-table
                :data="form.productList"
                border
                class="productList"
                :header-cell-style="{ 'text-align': 'center' }"
                :cell-style="{ 'text-align': 'center' }"
                style="width: 100%"
              >
                <el-table-column type="index" width="50" label="序号" fixed="left" />
                <el-table-column prop="productName" label="型号" fixed="left" width="150">
                  <template #default="scope">
                    <el-form-item :prop="'productList.' + scope.$index + '.productName'" :rules="valueRule">
                      <el-input v-model="scope.row.productName"></el-input>
                    </el-form-item>
                  </template>
                </el-table-column>
                <el-table-column prop="productDescription" label="产品描述" width="150" :show-overflow-tooltip="true">
                  <template #default="scope">
                    <el-input v-model="scope.row.productDescription"></el-input>
                  </template>
                </el-table-column>
                <el-table-column prop="productQuantity" label="数量" width="160">
                  <template #default="scope">
                    <el-input-number v-model="scope.row.productQuantity" :min="1"></el-input-number>
                  </template>
                </el-table-column>
                <el-table-column prop="supplierId" label="供应商" width="150">
                  <template #default="scope">
                    <el-form-item :prop="'productList.' + scope.$index + '.supplierId'" :rules="valueRule">
                      <simple-select
                        v-if="inquiryStatus < 3 || scope.row.edit"
                        v-model="scope.row.supplierId"
                        :defaultList="scope.row.defaultSupplierList"
                        :remoteFunction="searchSupplier"
                        searchKey="supplierName"
                        searchValue="supplierId"
                        :supplierEnable="1"
                        :brandId="form.rtBrand ? form.rtBrand.brandId : null"
                      />
                      <span v-else>{{ scope.row.supplierName }}</span>
                    </el-form-item>
                  </template>
                </el-table-column>
                <el-table-column prop="productPurchasePrice" label="未税单价" width="100">
                  <template #default="scope">
                    <el-form-item :prop="'productList.' + scope.$index + '.productPurchasePrice'" :rules="valueRule">
                      <el-input
                        v-if="inquiryStatus < 3 || scope.row.edit"
                        v-model="scope.row.productPurchasePrice"
                        @input="getPurchaseTotalPrice(scope.row)"
                      ></el-input>
                      <span v-else>{{ scope.row.productPurchasePrice }}</span>
                    </el-form-item>
                  </template>
                </el-table-column>
                <el-table-column prop="productReferencePrice" label="建议售价" width="100">
                  <template #default="scope">
                    <el-input
                      v-if="inquiryStatus < 3 || scope.row.edit"
                      v-model="scope.row.productReferencePrice"
                    ></el-input>
                    <span v-else>{{ scope.row.productReferencePrice }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="productPurchaseTotalPrice" label="采购总价" width="100">
                  <!-- <template #default="scope">
                    <span>{{ scope.row.productPurchasePrice * scope.row.productQuantity }}</span>
                  </template> -->
                </el-table-column>
                <el-table-column prop="productDeliveryTime" label="预计货期" width="100">
                  <template #default="scope">
                    <el-input
                      v-if="inquiryStatus < 3 || scope.row.edit"
                      v-model="scope.row.productDeliveryTime"
                    ></el-input>
                    <span v-else>{{ scope.row.productDeliveryTime }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="purchaseFileList" label="采购附件" width="150">
                  <template #default="scope">
                    <el-upload
                      v-if="inquiryStatus < 3 || scope.row.edit"
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
                        {{ item.fileName }}
                      </div>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="productPurchaseMethod" label="采购方式" width="100">
                  <template #default="scope">
                    <el-form-item
                      v-if="inquiryStatus < 3 || scope.row.edit"
                      :prop="'productList.' + scope.$index + '.productPurchaseMethod'"
                      :rules="valueRule"
                    >
                      <el-input v-model="scope.row.productPurchaseMethod"></el-input>
                    </el-form-item>
                    <span v-else>{{ scope.row.productPurchaseMethod }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  label="操作"
                  fixed="right"
                  align="center"
                  class-name="small-padding fixed-width"
                  width="80"
                >
                  <template #default="scope">
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
          </div>
        </el-form>
        <el-row class="bgWhite flex-center-right btn-box">
          <el-button type="primary" @click="handleAddProduct()">添加产品</el-button>
        </el-row>
      </el-main>
      <el-aside class="message-containar">
        <omsMessage></omsMessage>
      </el-aside>
    </el-container>
  </div>
</template>

<script setup name="Detail">
import { addOrder } from '@/api/order'
import { onBeforeMount, reactive } from 'vue'
import omsMessage from '@/views/componments/omsMessage'
import brandSelect from '@/views/componments/brandSelect'
import { deepClone } from '@/utils/index'
import { searchSupplier } from '@/api/brand'

import SimpleSelect from '@/components/SimpleSelect'
import { getToken } from '@/utils/auth'
import { getFloat } from '@/utils/index'
const { proxy } = getCurrentInstance()
const inquiryStatus = ref(0)
const userHasRole = ref(false)
const base = import.meta.env.VITE_APP_BASE_API
const headers = ref({ Authorization: 'Bearer ' + getToken() })

// 产品默认对象
const defaulfItem = {
  productName: null, // 型号
  productDescription: '', // 产品描述
  productQuantity: 1, // 采购数量
  salesFileList: [], //销售附件
}
// form 默认对象
const originForm = {
  rtBrand: null,
  inquiryDescription: '',
  productList: [defaulfItem],
}

const data = reactive({
  // 表单参数
  form: JSON.parse(JSON.stringify(originForm)),
  valueRule: { required: true, message: '请输入型号', trigger: 'change' },
  // 表单校验
  rules: {
    rtBrand: [{ required: true, message: '请选择品牌', trigger: 'change' }],
    piSn: [{ required: true, message: '请输入PI号', trigger: 'change' }],
  },
})
const { form, rules, valueRule } = toRefs(data)

onBeforeMount(() => {
  userHasRole.value = proxy.$auth.hasRoleOr(['admin', 'purchase'])
})
// 计算采购总价
function getPurchaseTotalPrice(item) {
  item.productPurchaseTotalPrice = getFloat(item.productPurchasePrice * item.productQuantity, 4)
  getTotalPrice()
}
// 计算询盘总价
function getTotalPrice() {
  console.log('计算总价')
  let price = 0
  for (let i = 0; i < form.value.productList.length; i++) {
    const item = form.value.productList[i]
    price += item.productPurchaseTotalPrice * 1
  }
  form.value.orderTotalPriceNoTax = getFloat(price, 4)
  // 税金
  form.value.orderTax = getFloat((form.value.orderTotalPriceNoTax * form.value.orderTaxRate) / 100, 4)
  // 总价
  let TotalPrice = form.value.orderTotalPriceNoTax * 1 + form.value.orderOtherFee * 1
  form.value.orderTotalPrice = getFloat(TotalPrice, 4)
}

function handleAddProduct() {
  form.value.productList.push(deepClone(defaulfItem))
}

//删除型号
function handleDeleteOrderItem(index) {
  proxy.$modal
    .confirm('是否确认删除序号为"' + (index + 1) + '"产品?')
    .then(function () {
      form.value.productList.splice(index, 1)
    })
    .then(() => {
      proxy.$modal.msgSuccess('删除成功')
    })
    .catch(() => {})
}

// 提交订单
function submitForm(orderStatus) {
  proxy.$refs['orderRef'].validate((valid) => {
    if (valid) {
      form.value.orderStatus = orderStatus + ''
      addOrder(form.value)
        .then((response) => {
          if (orderStatus === 1) {
            proxy.$modal.msgSuccess('保存成功')
          } else {
            proxy.$modal.msgSuccess('新增成功')
          }

          proxy.$tab.closeOpenPage({ path: '/order' })
        })
        .catch((err) => {
          proxy.$modal.msgError(err)
        })
    }
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
</script>

<style lang="scss">
/* style */
.add-order-detail {
  background: #eee;

  .btn-box {
    padding-top: 0;
  }
  .productList {
    .cell {
      padding: 0 4px 2px;
      overflow: visible;
    }
  }
  .totalPrice {
    font-size: 16px;
    line-height: 32px;
    padding-right: 20px;

    .blod {
      font-weight: bold;
    }
    .primary {
      color: var(--el-color-primary);
    }
  }
  .table-clumn-number .cell {
    padding: 0;

    input {
      line-height: 80px;
      border: none;
    }
  }

  .orderForm {
    .brand-desc {
      line-height: 40px;
    }
    .el-textarea {
      max-width: 420px;
    }
    .el-input {
      max-width: 420px;
    }
  }

  .brand-name {
    padding: 20px;
    font-size: 15px;
    line-height: 24px;
  }
  .purchase-order-main {
    box-sizing: border-box;
    background: #fff;
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
    margin-bottom: 0;
    flex-shrink: 0;
    // margin-left: 20px;
    box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.12);
    background: #fff;
    padding: 0;
    margin-left: 10px;
  }
  .total-price-left,
  .total-price-right {
    .total-price-content {
      // border: 1px solid var(--el-color-warning);
      min-height: 170px;
      // background: rgba(0, 0, 0, 0.03);
      // padding: 5px 20px 10px;
      margin-top: 20px;
      // border-radius: 15px;
      h3 {
        line-height: 1;
        margin: 15px 0;
      }
    }
  }
}
</style>
