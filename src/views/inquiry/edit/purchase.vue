<template>
  <div class="common-layout purchase-order-detail">
    <el-container>
      <el-main class="purchase-order-main">
        <div class="purchase-order-detail-header">
          <div class="desc">
            <dict-tag style="display: inline" :options="inquiry_status" :value="form.inquiryStatus" />
            <span>询价单号: {{ form.inquirySn }}</span>
            <span>销售负责人: {{ form.salesUserName }}</span>
            <span>采购负责人: {{ form.purchaseUserName || '未分配' }}</span>
            <span v-if="inquiryStatus <= 5">
              当前状态等待时长:
              <el-link type="warning">{{ timingTimeStr }}</el-link>
            </span>
          </div>
          <div class="right" v-show="!pageEdit">
            <div class="ml20">
              <el-button type="primary" icon="Back" circle size="small"></el-button>
              <span style="margin: 0 5px">1/15</span>
              <el-button type="primary" icon="Right" circle size="small"></el-button>
            </div>
            <ChatDotSquare style="font-size: 30px; width: 1em; height: 1em; margin-left: 10px; color: #e6a23c" />
          </div>
        </div>
        <el-row class="flex-center-right mt20">
          <!-- 编辑状态按钮 -->
          <div class="right" v-show="pageEdit">
            <el-button type="success" @click="handleSave">保存</el-button>
            <el-button @click="handleEditCancle">取消</el-button>
          </div>
          <!-- 默认状态按钮 -->
          <div class="right" v-show="!pageEdit">
            <el-button type="success" @click="pageEdit = true">编辑</el-button>
            <el-button type="success" @click="submitForm(0)" v-if="!inquiryStatus">保存为草稿</el-button>
            <el-button type="success" @click="submitForm(1)" v-if="!inquiryStatus">发送询价</el-button>
            <el-button type="danger">取消</el-button>
          </div>
        </el-row>
        <el-form ref="orderRef" :model="form" :rules="rules" label-width="80px" class="orderForm" :disabled="false">
          <div class="mt20">
            <el-form-item label="品牌" prop="rtBrand" width="600px" v-if="![5, 7].includes(inquiryStatus)">
              <brandSelect v-model="form.rtBrand" inquiryStatus disabled></brandSelect>
            </el-form-item>
            <el-form-item label="询盘描述" prop="inquiryDescription" v-if="![5, 7].includes(inquiryStatus)">
              <el-input
                :rows="3"
                type="textarea"
                v-model="form.inquiryDescription"
                placeholder="请输入询盘描述"
                :disabled="!pageEdit"
              />
            </el-form-item>
          </div>
          <div class="flex-center-left ml20 mt20 totalPrice" v-if="![0].includes(inquiryStatus)">
            <div>未税总价：¥0.00</div>
            <div class="ml20">税金：¥0.00</div>
            <div class="ml20">总价：¥0.00</div>
          </div>
          <div class="flex-center-left mt20">
            <el-form-item label="税率" prop="inquiryTaxRate" v-if="![0].includes(inquiryStatus)">
              <el-input
                v-model="form.inquiryTaxRate"
                placeholder="未税为0或者含税的税点"
                :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                style="width: 230px"
              >
                <template #append>%</template>
              </el-input>
            </el-form-item>
            <el-form-item label="杂费" prop="inquiryOtherFee" v-if="![0].includes(inquiryStatus)">
              <el-input
                v-model="form.inquiryOtherFee"
                placeholder="请输入包装费、税费、附加费等合计"
                style="width: 300px"
              >
                <template #append>元</template>
              </el-input>
            </el-form-item>
          </div>
          <div class="mt20">
            <el-form-item label="产品明细">
              <!-- <el-scrollbar> -->
              <el-table
                :data="form.productList"
                border
                class="productList"
                :header-cell-style="{ 'text-align': 'center' }"
                :cell-style="{ 'text-align': 'center' }"
                style="width: 100%"
              >
                <!-- :style="{ width: inquiryStatus ? 1200 : '100%' }" -->
                <el-table-column type="index" width="50" label="序号" fixed="left" />
                <el-table-column prop="productName" label="型号*" fixed="left">
                  <template #default="scope">
                    <el-form-item :prop="'productList.' + scope.$index + '.productName'" :rules="valueRule">
                      <el-input
                        v-model="scope.row.productName"
                        placeholder="请输入产品型号"
                        v-if="scope.row.edit"
                      ></el-input>
                      <span v-else>{{ scope.row.productName }}</span>
                    </el-form-item>
                  </template>
                </el-table-column>
                <el-table-column prop="productDescription" label="产品描述" :show-overflow-tooltip="true">
                  <template #default="scope">
                    <el-input
                      v-model="scope.row.productDescription"
                      placeholder="请输入产品描述"
                      v-if="scope.row.edit"
                    ></el-input>
                    <span v-else>{{ scope.row.productDescription }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="productQuantity" label="数量">
                  <template #default="scope">
                    <el-input-number
                      v-model="scope.row.productQuantity"
                      :min="1"
                      v-if="scope.row.edit"
                    ></el-input-number>
                    <span v-else>{{ scope.row.productQuantity }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="salesFileList" label="销售附件" width="150">
                  <template #default="scope">
                    <el-upload
                      v-model:file-list="scope.row.salesFileList"
                      :action="base + '/system/info/add'"
                      :limit="3"
                      :headers="headers"
                      accept=".jpg, .jpeg, .png, .doc, .docx, .xls, .xlsx, .pdf"
                      :on-success="handleUploadSuccess"
                      :on-preview="handleFilePreview"
                    >
                      <!-- <el-button type="primary" :disabled="!scope.row.edit">上传附件</el-button> -->
                      <el-icon v-if="scope.row.edit"><Plus /></el-icon>
                    </el-upload>
                  </template>
                </el-table-column>
                <el-table-column prop="supplierId" label="供应商" width="150">
                  <template #default="scope">
                    <simple-select
                      v-model="scope.row.supplierId"
                      :remoteFunction="searchSupplier"
                      searchKey="supplierName"
                      searchValue="supplierId"
                      placeholder="请输入供应商名称"
                    />
                  </template>
                </el-table-column>
                <el-table-column prop="productPurchasePrice" label="未税单价" width="140">
                  <template #default="scope">
                    <el-input v-model="scope.row.productPurchasePrice" placeholder="请输入未税单价"></el-input>
                  </template>
                </el-table-column>
                <el-table-column prop="productReferencePrice" label="建议售价" width="140">
                  <template #default="scope">
                    <el-input v-model="scope.row.productReferencePrice" placeholder="请输入建议售价"></el-input>
                  </template>
                </el-table-column>
                <el-table-column prop="productPurchaseTotalPrice" label="采购总价" width="100">
                  <template #default="scope">
                    <span>{{ scope.row.productPurchasePrice * scope.row.productQuantity }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="productDeliveryTime" label="预计货期" width="150">
                  <template #default="scope">
                    <el-input v-model="scope.row.productDeliveryTime" placeholder="请输入预计货期"></el-input>
                  </template>
                </el-table-column>
                <el-table-column prop="purchaseFileList" label="采购附件" width="150">
                  <template #default="scope">
                    <el-upload
                      v-model:file-list="scope.row.purchaseFileList"
                      :action="base + '/system/info/add'"
                      :limit="3"
                      :headers="headers"
                      accept=".jpg, .jpeg, .png, .doc, .docx, .xls, .xlsx, .pdf"
                      :on-success="handleUploadSuccess"
                      :on-preview="handleFilePreview"
                    >
                      <el-icon><Plus /></el-icon>
                      <!-- <el-button type="primary"  :disabled="!scope.row.edit">上传附件</el-button> -->
                    </el-upload>
                  </template>
                </el-table-column>
                <el-table-column prop="productPurchaseMethod" label="采购方式" width="150">
                  <template #default="scope">
                    <el-input v-model="scope.row.productPurchaseMethod" placeholder="请输入采购方式"></el-input>
                  </template>
                </el-table-column>

                <el-table-column label="操作" align="center" width="150" fixed="right">
                  <template #default="scope">
                    <el-tooltip
                      content="历史成交价"
                      placement="top"
                      v-if="scope.row.productId && ![0].includes(inquiryStatus)"
                    >
                      <el-button link type="primary" icon="Clock"></el-button>
                    </el-tooltip>
                    <el-tooltip content="编辑" placement="top" v-if="scope.row.productId">
                      <el-button
                        link
                        type="primary"
                        icon="Edit"
                        :disabled="!pageEdit || !scope.row.btnEdit"
                        @click="handleEditProduct(scope.$index)"
                      ></el-button>
                    </el-tooltip>
                    <el-tooltip content="删除" placement="top" v-if="scope.row.roleId !== 1">
                      <el-button
                        link
                        type="primary"
                        icon="Delete"
                        :disabled="!pageEdit || !scope.row.btnEdit"
                        @click="handleDeleteOrderItem(scope.row, scope.$index)"
                      ></el-button>
                    </el-tooltip>
                  </template>
                </el-table-column>
              </el-table>
              <!-- </el-scrollbar> -->
            </el-form-item>
          </div>
        </el-form>
        <el-row class="bgWhite flex-center-right btn-box">
          <el-button v-show="pageEdit" :disabled="btnAddDiabled" type="primary" @click="handleAddProduct()">
            添加产品
          </el-button>
        </el-row>
      </el-main>
      <el-aside class="message-containar">
        <orderMessage :id="inquiryId" :inquirySn="form.inquirySn"></orderMessage>
        <!-- 消息面板 -->
        <!-- <omsMessage v-else></omsMessage> -->
      </el-aside>
    </el-container>
    <!-- <el-dialog v-model="dialogVisible">
      <img w-full :src="dialogImageUrl" alt="Preview Image" />
    </el-dialog> -->
  </div>
</template>

<script setup name="Detail">
import { addInquiry, getInquiry, updateInquiry } from '@/api/inquiry'
import { updateProduct, delProduct } from '@/api/product'
import { searchUser, searchSupplier, searchBrand } from '@/api/brand'
import { onBeforeMount, reactive } from 'vue'
import orderMessage from './orderMessage'
import omsMessage from '@/views/componments/omsMessage'
import brandSelect from '@/views/componments/brandSelect'
import { deepClone } from '@/utils/index'
import SimpleSelect from '@/components/SimpleSelect'

import { getToken } from '@/utils/auth'
const { proxy } = getCurrentInstance()
const { inquiry_status } = proxy.useDict('inquiry_status')
const inquiryStatus = ref(0)
const inquiryId = proxy.$route.query.id
const userHasRole = ref(false)
const base = import.meta.env.VITE_APP_BASE_API
const headers = ref({ Authorization: 'Bearer ' + getToken() })
const timingTimeStr = ref('')
const pageEdit = ref(false)
const btnAddDiabled = ref(false)
const updatedProductId = ref(null)
const originData = ref({})

// 产品默认对象
const defaulfItem = {
  edit: true,
  btnEdit: true,
  productName: null, // 型号
  productDescription: '', // 产品描述
  productQuantity: 1, // 采购数量
  salesFileList: [], //销售附件
}
// form 默认对象
const originForm = {
  rtBrand: null,
  inquiryDescription: '',
  productList: [],
}

const data = reactive({
  // 表单参数
  form: JSON.parse(JSON.stringify(originForm)),
  valueRule: { required: true, message: '请输入型号', trigger: 'change' },
  // 表单校验
  rules: {
    rtBrand: [{ required: true, message: '请选择品牌', trigger: 'change' }],
  },
})
const { form, rules, valueRule } = toRefs(data)

onBeforeMount(() => {
  userHasRole.value = proxy.$auth.hasRoleOr(['admin', 'purchase'])
  if (inquiryId) {
    getInfo()
  }
})
// 获取当前询盘信息
function getInfo() {
  getInquiry(inquiryId).then((res) => {
    let data = res.data
    inquiryStatus.value = data.inquiryStatus
    if (data.productList) {
      data.productList = data.productList.map((item) => {
        item.edit = false
        item.btnEdit = true
        // if (item.purchasePrice) {
        //   totalPrice.value = totalPrice.value + item.purchasePrice * item.quantity
        // }
        // item.model = {
        //   modelId: item.modelId,
        //   modelName: item.modelName,
        // }
        // item.supplier = {
        //   supplierId: item.supplierId,
        //   supplierName: item.supplierName,
        // }
        return item
      })
    }

    nextTick(() => {
      originData.value = data
      form.value = deepClone(originData.value)
      setInterval(() => {
        timingTimeStr.value = timingTime(form.value.inquiryStatusUpdateTime)
      })
    })
  })
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
  return day + '天' + ss + '小时' + ff + '分' + mm + '秒'
}
function handleAddProduct() {
  form.value.productList.push(deepClone(defaulfItem))
  form.value.productList = form.value.productList.map((item) => {
    if (item.productId) {
      item.btnEdit = false
    }
    return item
  })
}

//删除型号
function handleDeleteOrderItem(item, index) {
  proxy.$modal
    .confirm('当前操作不可恢复，是否确认删除序号为"' + (index + 1) + '"产品?')
    .then(function () {
      if (item.productId) {
        delProduct(item.productId).then((res) => {
          proxy.$modal.msgSuccess('删除成功')
          getInfo()
        })
      } else {
        form.value.productList.splice(index, 1)
        proxy.$modal.msgSuccess('删除成功')
      }
    })
    .catch(() => {})
}

// 提交订单
function submitForm(inquiryStatus) {
  proxy.$refs['orderRef'].validate((valid) => {
    if (valid) {
      form.value.inquiryStatus = inquiryStatus
      addInquiry(form.value)
        .then((response) => {
          if (inquiryStatus === 1) {
            proxy.$modal.msgSuccess('保存成功')
          } else {
            proxy.$modal.msgSuccess('新增成功')
          }

          proxy.$tab.closeOpenPage({ path: '/inquiry' })
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
// 编辑产品
function handleEditProduct(index) {
  updatedProductId.value = form.value.productList[index].productId
  for (let i = 0; i < form.value.productList.length; i++) {
    const product = form.value.productList[i]
    if (i === index) {
      product.edit = true
    }
    product.btnEdit = false
    btnAddDiabled.value = true
  }
}
// 保存编辑
function handleSave() {
  proxy.$refs['orderRef'].validate((valid) => {
    if (valid) {
      form.value.inquiryStatus = inquiryStatus
      updateInquiry({
        inquiryId: form.value.inquiryId,
        updatedProductId: updatedProductId.value,
        productList: form.value.productList,
        inquiryDescription: form.value.inquiryDescription,
      }).then((response) => {
        proxy.$modal.msgSuccess('保存成功')
        pageEdit.value = false
        btnAddDiabled.value = false
        getInfo()
      })
    }
  })
}
// 取消编辑
function handleEditCancle() {
  pageEdit.value = false
  btnAddDiabled.value = false
  form.value = deepClone(originData.value)
}
</script>

<style lang="scss">
/* style */
.purchase-order-detail {
  background: #eee;
  .orderForm {
    .el-textarea {
      max-width: 420px;
    }
    .el-input {
      max-width: 420px;
    }
  }
  .btn-box {
    padding-top: 0;
  }
  .productList {
    .cell {
      padding: 0 4px 2px;
      // overflow: visible;/
    }
  }
  .totalPrice {
    // display: flex;
    // justify-content: end;
    font-size: 18px;
    color: var(--el-color-warning);
    padding-right: 20px;
    font-weight: bold;
    span {
      font-size: 22px;
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
    font-size: 14px;
    display: flex;
    justify-content: space-between;

    border-bottom: 1px solid var(--el-border-color);
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
  .purchase-order-main {
    box-sizing: border-box;
    background: #fff;
    padding-top: 5px;
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
    overflow: hidden;
    max-width: 350px;
    margin-bottom: 0;
    flex-shrink: 0;
    // margin-left: 20px;
    box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.12);
    background: #fff;
    padding: 0;
    margin-left: 10px;
  }
}
</style>
