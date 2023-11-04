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
          <div class="right">
            <el-button v-show="[0, 6].includes(inquiryStatus)" type="primary" @click="submitForm(6)">
              编辑询价单
            </el-button>
            <el-button v-show="[0, 6].includes(inquiryStatus)" type="success" @click="submitForm(1)">
              发送询价
            </el-button>
            <el-button v-show="[0, 6].includes(inquiryStatus)" type="danger" @click="cancel()">取消</el-button>
            <div class="ml20">
              <el-button type="primary" icon="Back" circle size="small"></el-button>
              <span style="margin: 0 5px">1/15</span>
              <el-button type="primary" icon="Right" circle size="small"></el-button>
            </div>
            <ChatDotSquare style="font-size: 30px; width: 1em; height: 1em; margin-left: 10px; color: #e6a23c" />
          </div>
        </div>
        <el-row class="flex-center-right"></el-row>
        <el-form ref="orderRef" :model="form" :rules="rules" label-width="80px" :disabled="false">
          <div class="mt20">
            <el-form-item label="品牌" prop="rtBrand" width="600px" v-if="![5, 7].includes(inquiryStatus)">
              <brandSelect v-model="form.rtBrand" inquiryStatus></brandSelect>
            </el-form-item>
            <el-form-item label="询盘描述" prop="inquiryDescription" v-if="![5, 7].includes(inquiryStatus)">
              <el-input
                :rows="3"
                type="textarea"
                v-model="form.inquiryDescription"
                placeholder="请输入询盘描述"
                :disabled="inquiryStatus == 5 || inquiryStatus == 7"
              />
            </el-form-item>
          </div>
          <div class="mt20">
            <el-form-item label="产品明细" v-if="inquiryStatus != 5 && inquiryStatus != 7">
              <el-table
                :data="form.productList"
                border
                class="productList"
                :header-cell-style="{ 'text-align': 'center' }"
                :cell-style="{ 'text-align': 'center' }"
                style="width: 100%"
              >
                <el-table-column type="index" width="50" label="序号" />
                <el-table-column prop="productName" label="型号*">
                  <template #default="scope">
                    <el-form-item :prop="'productList.' + scope.$index + '.productName'" :rules="valueRule">
                      <el-input v-model="scope.row.productName" placeholder="请输入产品型号"></el-input>
                    </el-form-item>
                  </template>
                </el-table-column>
                <el-table-column prop="productDescription" label="产品描述" :show-overflow-tooltip="true">
                  <template #default="scope">
                    <el-input v-model="scope.row.productDescription" placeholder="请输入产品描述"></el-input>
                  </template>
                </el-table-column>
                <el-table-column prop="productQuantity" label="数量">
                  <template #default="scope">
                    <el-input-number v-model="scope.row.productQuantity" :min="1"></el-input-number>
                  </template>
                </el-table-column>
                <el-table-column prop="salesFileList" label="销售附件">
                  <template #default="scope">
                    <el-upload
                      v-model:file-list="scope.row.salesFileList"
                      :action="base + '/system/info/add'"
                      :limit="3"
                      :headers="headers"
                      accept=".jpg, .jpeg, .png, .doc, .docx, .xls, .xlsx, .pdf"
                      :on-success="handleUploadSuccess"
                    >
                      <el-button type="primary">上传附件</el-button>
                    </el-upload>
                  </template>
                </el-table-column>
                <el-table-column
                  v-if="inquiryStatus != 5 && inquiryStatus != 7"
                  label="操作"
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
          <el-button v-show="[0, 6].includes(inquiryStatus)" type="success" @click="submitForm(0)">
            保存为草稿
          </el-button>
          <el-button v-show="[0, 6].includes(inquiryStatus)" type="success" @click="submitForm(1)">发送询价</el-button>
          <el-button v-show="[0, 6].includes(inquiryStatus)" type="primary" @click="handleAddProduct()">
            添加产品
          </el-button>
        </el-row>
      </el-main>
      <el-aside class="message-containar">
        <orderMessage v-if="form.purchaseId" :purchaseId="form.purchaseId"></orderMessage>
        <!-- 消息面板 -->
        <omsMessage v-else></omsMessage>
      </el-aside>
    </el-container>
  </div>
</template>

<script setup name="Detail">
import { addInquiry, getInquiry } from '@/api/inquiry'
import { onBeforeMount, reactive } from 'vue'
import orderMessage from './orderMessage'
import omsMessage from '@/views/componments/omsMessage'
import brandSelect from '@/views/componments/brandSelect'
import { deepClone } from '@/utils/index'

import { getToken } from '@/utils/auth'
const { proxy } = getCurrentInstance()
const { inquiry_status } = proxy.useDict('inquiry_status')
const inquiryStatus = ref(0)
const inquiryId = proxy.$route.query.id
const userHasRole = ref(false)
const base = import.meta.env.VITE_APP_BASE_API
const headers = ref({ Authorization: 'Bearer ' + getToken() })
const timingTimeStr = ref('')

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
  },
})
const { form, rules, valueRule } = toRefs(data)

onBeforeMount(() => {
  userHasRole.value = proxy.$auth.hasRoleOr(['admin', 'purchase'])
  if (inquiryId) {
    getInquiry(inquiryId).then((res) => {
      nextTick(() => {
        let data = res.data
        inquiryStatus.value = data.inquiryStatus
        // canChange.value = proxy.$auth.hasRoleOr(['admin', 'common']) && [1, 2, 3, 4, 6, 7].includes(data.inquiryStatus)

        // brandSearchList.value.push(data.rtBrand)
        // if (data.productList) {
        //   data.productList = data.productList.map((item) => {
        //     if (item.purchasePrice) {
        //       totalPrice.value = totalPrice.value + item.purchasePrice * item.quantity
        //     }
        //     item.model = {
        //       modelId: item.modelId,
        //       modelName: item.modelName,
        //     }
        //     item.supplier = {
        //       supplierId: item.supplierId,
        //       supplierName: item.supplierName,
        //     }
        //     return item
        //   })
        // }

        nextTick(() => {
          form.value = data
          setInterval(() => {
            timingTimeStr.value = timingTime(form.value.inquiryStatusUpdateTime)
          })
        })
      })
    })
  }
})
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
</script>

<style lang="scss">
/* style */
.purchase-order-detail {
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
    display: flex;
    justify-content: end;
    font-size: 16px;
    color: var(--el-color-warning);
    padding-right: 20px;
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
}
</style>
