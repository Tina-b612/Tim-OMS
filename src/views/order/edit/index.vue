<template>
  <div class="common-layout order-detail">
    <el-container>
      <el-main class="purchase-order-main">
        <!-- 订单基础信息 -->
        <div class="order-detail-header">
          <div class="desc">
            <dict-tag style="display: inline" :options="order_status" :value="form.orderStatus" />
            <span>询盘单号: {{ form.inquirySn || '-' }}</span>
            <span>采购单号: {{ form.orderSn || '-' }}</span>
            <span>销售负责人: {{ form.salesUserName || '-' }}</span>
            <span>采购负责人: {{ form.purchaseUserName || '未分配' }}</span>
            <span v-if="orderStatus <= 5">
              当前状态等待时长:
              <el-link type="warning">{{ timingTimeStr }}</el-link>
            </span>
          </div>
          <!-- 切换订单暂时没做，隐藏一下 -->
          <!-- <div v-show="!pageEdit">
            <div class="ml20">
              <el-button type="primary" icon="Back" circle size="small"></el-button>
              <span style="margin: 0 5px">1/15</span>
              <el-button type="primary" icon="Right" circle size="small"></el-button>
            </div>
            <ChatDotSquare style="font-size: 30px; width: 1em; height: 1em; margin-left: 10px; color: #e6a23c" />
          </div> -->
        </div>
        <!-- 订单操作按钮 -->
        <el-row class="flex-center-right mt20" v-show="loading">
          <!-- 编辑状态按钮 -->
          <div class="right" v-show="pageEdit">
            <el-button type="success" @click="handleSave">保存</el-button>
            <el-button @click="handleEditCancle">取消</el-button>
          </div>
          <!-- 默认状态按钮 -->
          <div class="right" v-show="!pageEdit">
            <el-button type="success" v-show="orderStatus === 1" @click="pageEdit = true">编辑</el-button>
            <el-button type="success" @click="submitForm(0)" v-if="!orderStatus">保存为草稿</el-button>
            <!-- <el-button type="success" @click="submitForm(0)" v-if="!orderStatus">申请采购</el-button> -->
            <el-button type="success" @click="openPayInfo" v-if="[0, 1].includes(orderStatus)">申请付款</el-button>
            <el-button type="success" @click="submitForm(5)" v-if="[4].includes(orderStatus)">已签收</el-button>
            <el-button type="success" @click="handleSignFor(6)" v-if="[4].includes(orderStatus)">异常签收</el-button>
            <el-button type="danger" @click="submitForm(7)" v-if="![7].includes(orderStatus)">取消</el-button>
          </div>
        </el-row>
        <!-- 表单 -->
        <el-form ref="orderRef" :model="form" :rules="rules" label-width="80px" class="orderForm" :disabled="false">
          <!-- 品牌 -->
          <div class="mt20">
            <el-descriptions size="large" class="ml20 inquiryInfo" style="width: 800px" :column="2">
              <el-descriptions-item label="品牌" class-name="brandInfo">
                <div v-if="form.rtBrand" style="display: inline-block">
                  <el-avatar shape="square" :src="form.rtBrand.brandLogo">
                    <img src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png" />
                  </el-avatar>
                  <span class="ml10">{{ form.rtBrand.brandName }}</span>
                </div>
              </el-descriptions-item>
              <el-descriptions-item label="PI号">
                {{ form.piSn }}
              </el-descriptions-item>
              <el-descriptions-item label="订单描述" class-name="orderDescription" v-if="!pageEdit && !!orderStatus">
                {{ form.orderDescription }}
              </el-descriptions-item>
            </el-descriptions>

            <el-form-item
              class="mt20"
              label="订单描述"
              prop="orderDescription"
              v-if="pageEdit || [0].includes(orderStatus)"
            >
              <el-input
                :rows="3"
                maxlength="255"
                show-word-limit
                type="textarea"
                v-model="form.orderDescription"
                placeholder="请输入订单描述"
              />
            </el-form-item>
          </div>
          <!-- 合计 -->
          <el-row :gutter="20">
            <!-- 订单合计 -->
            <el-col :span="10" class="total-price-left">
              <el-card class="total-price-content" header="本单合计">
                <!-- <h3 class="ml20">本单合计</h3> -->
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

                    <el-input
                      v-if="pageEdit || [0].includes(orderStatus)"
                      v-model="form.orderTaxRate"
                      style="width: 130px"
                      @input="getTotalPrice"
                    >
                      <template #append>%</template>
                    </el-input>
                    <span v-else>{{ form.orderTaxRate || 0 }} %</span>
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
                    <el-input
                      v-if="pageEdit || [0].includes(orderStatus)"
                      v-model="form.orderOtherFee"
                      style="width: 150px"
                      @input="getTotalPrice"
                    >
                      <template #append>元</template>
                    </el-input>
                    <span v-else>¥ {{ form.orderOtherFee || 0 }}</span>
                  </el-form-item>
                </div>
              </el-card>
            </el-col>
            <!-- 付款合同 暂时没做 -->
            <!-- 付款列表 -->
            <el-col :span="14" class="total-price-right" v-if="orderStatus > 1">
              <el-card class="total-price-content" header="付款列表">
                <!-- <h3 class="ml20">付款列表</h3> -->
                <el-table
                  :data="form.paymentList"
                  border
                  :header-cell-style="{ 'text-align': 'center' }"
                  :cell-style="{ 'text-align': 'center' }"
                  style="width: 100%"
                >
                  <el-table-column type="expand">
                    <template #default="scope">
                      <el-descriptions size="small" style="padding: 5px 20px">
                        <el-descriptions-item label="付款编号">{{ scope.row.paymentSn || '-' }}</el-descriptions-item>
                        <el-descriptions-item label="供应商">
                          {{ scope.row.paymentPayeeName || '-' }}
                        </el-descriptions-item>
                        <el-descriptions-item label="开户行">
                          {{ scope.row.paymentBankName || '-' }}
                        </el-descriptions-item>
                        <el-descriptions-item label="收款账号">
                          {{ scope.row.paymentPayeeAccount || '-' }}
                        </el-descriptions-item>
                        <el-descriptions-item label="付款方式">
                          {{ scope.row.paymentMethod || '-' }}
                        </el-descriptions-item>
                        <el-descriptions-item label="付款描述">
                          {{ scope.row.paymentDescription || '-' }}
                        </el-descriptions-item>
                        <el-descriptions-item label="付款申请时间">
                          {{ scope.row.paymentApplyTime || '-' }}
                        </el-descriptions-item>
                        <el-descriptions-item label="付款完成时间">
                          {{ scope.row.paymentFinishTime || '-' }}
                        </el-descriptions-item>
                      </el-descriptions>
                    </template>
                  </el-table-column>
                  <!-- <el-table-column type="index" width="60" label="序号" /> -->
                  <el-table-column label="供应商" prop="orderSn" />
                  <el-table-column label="金额" prop="paymentAmount" />
                  <el-table-column label="采购合同" prop="paymentContractFileList">
                    <template #default="scope">
                      <div v-for="item in scope.row.paymentContractFileList">{{ item.fileName }}</div>
                    </template>
                  </el-table-column>
                  <el-table-column label="付款状态" prop="paymentContractFileList">
                    <template #default="scope">
                      <dict-tag style="display: inline" :options="payment_status" :value="scope.row.paymentStatus" />
                    </template>
                  </el-table-column>
                  <el-table-column label="付款证明" prop="paymentProveFileList" v-if="proxy.$auth.hasRole('manager')">
                    <template #default="scope">
                      <el-upload
                        v-if="!scope.row.paymentStatus"
                        v-model:file-list="scope.row.paymentProveFileList"
                        :action="base + '/system/info/add'"
                        :limit="1"
                        :headers="headers"
                        accept=".jpg, .jpeg, .png, .doc, .docx, .xls, .xlsx, .pdf"
                        :on-success="handleUploadSuccess"
                        :on-preview="handleFilePreview"
                      >
                        <el-icon><Plus /></el-icon>
                      </el-upload>
                      <div v-else class="link-type text-overflow fs12">
                        <a :href="scope.row.paymentContractFileList[0].url" target="_blank">
                          {{ scope.row.paymentContractFileList[0].fileName }}
                        </a>
                        <!-- <el-button link type="primary">
                          
                        </el-button> -->
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" prop="orderSn" v-if="proxy.$auth.hasRole('manager')">
                    <template #default="scope">
                      <el-tooltip content="确认付款" placement="top">
                        <el-button
                          type="primary"
                          icon="Sell"
                          link
                          @click="handlePay(scope.row)"
                          :disabled="scope.row.paymentStatus !== 0"
                        ></el-button>
                      </el-tooltip>
                      <el-tooltip content="拒绝付款" placement="top">
                        <el-button
                          type="danger"
                          icon="SoldOut"
                          link
                          :disabled="scope.row.paymentStatus !== 0"
                          @click="handleCanclePay(scope.row)"
                        ></el-button>
                      </el-tooltip>
                    </template>
                  </el-table-column>
                </el-table>
              </el-card>
            </el-col>
          </el-row>
          <!-- <el-form-item
            size="large"
            class="mt20"
            label="PI号"
            prop="piSn"
            v-if="orderStatus >= 3 && proxy.$auth.hasRoleOr(['sales','salesAdmin'])"
          >
            <el-input v-model="form.piSn" placeholder="请输入PI号" v-if="orderStatus === 3" />
            <span v-else>{{ form.piSn }}</span>
          </el-form-item> -->

          <!-- 
          <p>{{ ![0].includes(orderStatus) }}</p>
          <p>{{ proxy.$auth.hasRoleOr(['purchase', 'purchaseAdmin']) && pageEdit }}</p> -->
          <div class="mt20">
            <el-form-item label="产品明细">
              <el-table
                :data="form.productList"
                border
                class="productList"
                :header-cell-style="{ 'text-align': 'center' }"
                :cell-style="{ 'text-align': 'center' }"
                style="width: 100%"
                @selection-change="handleSelectionChange"
              >
                <el-table-column type="selection" width="55" v-if="orderStatus === 3" />
                <!-- <el-table-column type="index" width="50" label="序号" fixed="left" /> -->
                <el-table-column
                  prop="productName"
                  label="型号"
                  fixed="left"
                  :width="[0].includes(orderStatus) || pageEdit ? 160 : 'auto'"
                >
                  <template #default="scope">
                    <el-form-item :prop="'productList.' + scope.$index + '.productName'" :rules="valueRule">
                      <el-input
                        v-model="scope.row.productName"
                        placeholder="请输入产品型号"
                        v-if="scope.row.edit || orderStatus === 0"
                      ></el-input>
                      <span v-else>{{ scope.row.productName }}</span>
                    </el-form-item>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="productDescription"
                  label="产品描述"
                  :show-overflow-tooltip="true"
                  :width="[0].includes(orderStatus) || pageEdit ? 160 : 'auto'"
                >
                  <template #default="scope">
                    <el-input
                      v-model="scope.row.productDescription"
                      placeholder="请输入产品描述"
                      v-if="scope.row.edit || orderStatus === 0"
                    ></el-input>
                    <span v-else>{{ scope.row.productDescription }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="productQuantity"
                  label="数量"
                  :width="[0].includes(orderStatus) || pageEdit ? 160 : 'auto'"
                >
                  <template #default="scope">
                    <el-input-number
                      v-model="scope.row.productQuantity"
                      :min="1"
                      v-if="scope.row.edit || orderStatus === 0"
                      @input="getPurchaseTotalPrice(scope.row)"
                    ></el-input-number>
                    <span v-else>{{ scope.row.productQuantity }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="salesFileList" label="销售附件" width="150">
                  <template #default="scope">
                    <el-upload
                      v-if="scope.row.edit || orderStatus === 0"
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
                      {{ item.fileName }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="supplierId" label="供应商" width="150" v-hasRole="['purchase', 'purchaseAdmin']">
                  <template #default="scope">
                    <el-form-item :prop="'productList.' + scope.$index + '.supplierId'" :rules="valueRule">
                      <simple-select-local
                        v-if="!orderStatus || scope.row.edit"
                        v-model="scope.row.supplierId"
                        :defaultList="form.supplierList"
                        searchKey="supplierName"
                        searchValue="supplierId"
                      />
                      <span v-else>{{ scope.row.supplierName }}</span>
                    </el-form-item>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="productPurchasePrice"
                  label="未税单价"
                  v-if="orderStatus >= 3 || proxy.$auth.hasRoleOr(['purchase', 'purchaseAdmin'])"
                  width="100"
                >
                  <template #default="scope">
                    <el-form-item :prop="'productList.' + scope.$index + '.productPurchasePrice'" :rules="valueRule">
                      <el-input
                        v-if="!orderStatus || scope.row.edit"
                        v-model="scope.row.productPurchasePrice"
                        @input="getPurchaseTotalPrice(scope.row)"
                      ></el-input>
                      <span v-else>{{ scope.row.productPurchasePrice }}</span>
                    </el-form-item>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="productReferencePrice"
                  label="建议售价"
                  v-if="orderStatus >= 3 || proxy.$auth.hasRoleOr(['purchase', 'purchaseAdmin'])"
                  width="100"
                >
                  <template #default="scope">
                    <el-input
                      v-if="!orderStatus || scope.row.edit"
                      v-model="scope.row.productReferencePrice"
                    ></el-input>
                    <span v-else>{{ scope.row.productReferencePrice }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="orderPurchaseTotalPrice"
                  label="采购总价"
                  v-if="orderStatus >= 3 || proxy.$auth.hasRoleOr(['purchase', 'purchaseAdmin'])"
                  width="100"
                >
                  <!-- <template #default="scope">
                    <span>{{ scope.row.productPurchasePrice * scope.row.productQuantity }}</span>
                  </template> -->
                </el-table-column>
                <el-table-column
                  prop="productDeliveryTime"
                  label="预计货期"
                  v-if="orderStatus >= 3 || proxy.$auth.hasRoleOr(['purchase', 'purchaseAdmin'])"
                  width="100"
                >
                  <template #default="scope">
                    <el-input v-if="!orderStatus || scope.row.edit" v-model="scope.row.productDeliveryTime"></el-input>
                    <span v-else>{{ scope.row.productDeliveryTime }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="purchaseFileList"
                  label="采购附件"
                  v-if="orderStatus >= 3 || proxy.$auth.hasRoleOr(['purchase', 'purchaseAdmin'])"
                  width="150"
                >
                  <template #default="scope">
                    <el-upload
                      v-if="!orderStatus || scope.row.edit"
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
                <el-table-column
                  prop="productPurchaseMethod"
                  label="采购方式"
                  v-if="orderStatus >= 3 || proxy.$auth.hasRoleOr(['purchase', 'purchaseAdmin'])"
                  width="100"
                >
                  <template #default="scope">
                    <el-form-item
                      v-if="!orderStatus || scope.row.edit"
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
                  align="center"
                  width="150"
                  fixed="right"
                  v-if="[0, 1].includes(orderStatus)"
                >
                  <template #default="scope">
                    <el-tooltip
                      content="历史成交价"
                      placement="top"
                      v-if="
                        scope.row.productId &&
                        ![0].includes(orderStatus) &&
                        proxy.$auth.hasRoleOr(['purchase', 'purchaseAdmin'])
                      "
                    >
                      <el-button link type="primary" icon="Clock"></el-button>
                    </el-tooltip>
                    <el-tooltip content="编辑" placement="top" v-if="scope.row.productId && ![0].includes(orderStatus)">
                      <el-button
                        link
                        type="primary"
                        icon="Edit"
                        :disabled="!pageEdit || !scope.row.btnEdit"
                        @click="handleEditProduct(scope.$index)"
                      ></el-button>
                    </el-tooltip>
                    <el-tooltip content="删除" placement="top" v-if="[0].includes(orderStatus)">
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
                        :disabled="!pageEdit || !scope.row.btnEdit"
                        @click="handleDeleteOrderItem(scope.row, scope.$index)"
                      ></el-button>
                    </el-tooltip>
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>
          </div>
        </el-form>
        <el-row class="bgWhite flex-center-right btn-box">
          <el-button
            v-show="pageEdit || [0].includes(orderStatus)"
            :disabled="btnAddDiabled"
            type="primary"
            @click="handleAddProduct()"
          >
            添加产品
          </el-button>
        </el-row>
      </el-main>
      <el-aside class="message-containar">
        <orderMessage :id="orderId" :orderSn="form.orderSn" ref="orderMessageRef"></orderMessage>
      </el-aside>
    </el-container>
    <payInfoDialog ref="payInfoDialogRef" @submit="submitForm" :ordersupplierList="ordersupplierList" />
    <signForModel ref="signForModelRef" @submit="submitForm" />
  </div>
</template>

<script setup name="Detail">
import { getOrder, updateOrder, editOrderStatus, payment } from '@/api/order'
import { delProduct } from '@/api/product'
import { delFile } from '@/api/system/info'
import { nextTick, onBeforeMount, reactive, ref } from 'vue'
import orderMessage from './orderMessage'
import { deepClone } from '@/utils/index'
import SimpleSelectLocal from '@/components/SimpleSelectLocal'
import signForModel from './signForModel.vue'
import payInfoDialog from './payInfoDialog.vue'
import { getToken } from '@/utils/auth'
import useUserStore from '@/store/modules/user'
import { getFloat } from '@/utils/index'
const user = useUserStore()
const { proxy } = getCurrentInstance()
const { order_status } = proxy.useDict('order_status')
const { payment_status } = proxy.useDict('payment_status')
const orderStatus = ref(0)
const orderId = proxy.$route.query.id
const base = import.meta.env.VITE_APP_BASE_API
const headers = ref({ Authorization: 'Bearer ' + getToken() })
const timingTimeStr = ref('')
const pageEdit = ref(false)
const btnAddDiabled = ref(false)
const updatedProductId = ref(null)
const originData = ref({})
const multipleSelection = ref([])
const ordersupplierList = ref([])
const loading = ref(false)

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
  valueRule: { required: true, message: '请输入', trigger: 'change' },
  // 表单校验
  rules: {
    rtBrand: [{ required: true, message: '请选择品牌', trigger: 'change' }],
    // piSn: [{ required: true, message: '请输入PI号', trigger: 'change' }],
  },
})
const { form, rules, valueRule } = toRefs(data)

onBeforeMount(() => {
  if (orderId) {
    getInfo()
  }
})

// 计算采购总价
function getPurchaseTotalPrice(item) {
  item.orderPurchaseTotalPrice = getFloat(item.productPurchasePrice * item.productQuantity, 4)
  getTotalPrice()
}
// 计算订单总价
function getTotalPrice() {
  console.log('计算总价')
  let price = 0
  for (let i = 0; i < form.value.productList.length; i++) {
    const item = form.value.productList[i]
    price += item.orderPurchaseTotalPrice * 1
  }
  form.value.orderTotalPriceNoTax = getFloat(price, 4)
  // 税金
  form.value.orderTax = getFloat((form.value.orderTotalPriceNoTax * form.value.orderTaxRate) / 100, 4)
  // 总价
  let TotalPrice = form.value.orderTotalPriceNoTax * 1 + form.value.orderOtherFee * 1
  form.value.orderTotalPrice = getFloat(TotalPrice, 4)
  console.log('orderTotalPrice:' + form.value.orderTotalPriceNoTax)
}

// 获取当前询盘信息
function getInfo() {
  getOrder(orderId).then((res) => {
    let data = res.data
    orderStatus.value = data.orderStatus * 1

    if (data.productList) {
      data.productList = data.productList.map((item) => {
        item.edit = false
        item.btnEdit = true
        item.defaultSupplierList = [
          {
            supplierId: item.supplierId,
            supplierName: item.supplierName,
          },
        ]
        ordersupplierList.value.push({
          supplierId: item.supplierId,
          supplierName: item.supplierName,
        })
        console.log(ordersupplierList.value)
        return item
      })
    }

    nextTick(() => {
      originData.value = data
      loading.value = true
      form.value = deepClone(originData.value)
      setInterval(() => {
        timingTimeStr.value = timingTime(form.value.orderStatusUpdateTime)
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
// 添加产品
function handleAddProduct() {
  form.value.productList.push(deepClone(defaulfItem))
  form.value.productList = form.value.productList.map((item) => {
    if (item.productId) {
      item.btnEdit = false
    }
    return item
  })
}
// 删除产品
function handleDeleteOrderItem(item, index) {
  proxy.$modal.confirm('当前操作不可恢复，是否确认删除本产品?').then(function () {
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
// 提交订单
function submitForm(orderStatus, payment) {
  if (orderStatus === 7) {
    proxy.$modal.confirm('当前操作不可恢复，是否确认取消订单？').then(() => {
      editOrderStatus({ ...form.value, orderStatus }).then((response) => {
        proxy.$modal.msgSuccess('保存成功')
        proxy.$tab.closeOpenPage({ path: '/order' })
      })
    })
    return
  }
  if (orderStatus === 6) {
    form.value.orderReceiptedException = payment.orderReceiptedException
  }
  proxy.$refs['orderRef'].validate((valid) => {
    if (valid) {
      if (orderStatus === 2) {
        form.value.paymentList = payment
      }

      editOrderStatus({ ...form.value, orderStatus }).then((response) => {
        proxy.$modal.msgSuccess('保存成功')
        proxy.$tab.closeOpenPage({ path: '/order' })
      })
    }
  })
}
// 异常签收弹窗
function handleSignFor() {
  // console.log('异常签收')
  proxy.$refs.signForModelRef.show()
}
// 保存编辑
function handleSave() {
  proxy.$refs['orderRef'].validate((valid) => {
    if (valid) {
      form.value.orderStatus = orderStatus
      updateOrder({ ...form.value, updatedProductId: updatedProductId.value }).then((response) => {
        proxy.$modal.msgSuccess('保存成功')
        pageEdit.value = false
        btnAddDiabled.value = false
        getInfo()
        proxy.$refs.orderMessageRef.getChatList('new')
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
// 取消编辑
function handleEditCancle() {
  pageEdit.value = false
  btnAddDiabled.value = false
  form.value = deepClone(originData.value)
}
// 选择产品
function handleSelectionChange(val) {
  // console.log(val)
  multipleSelection.value = val
  let price = 0
  let count = 0
  for (let i = 0; i < val.length; i++) {
    const item = val[i]
    price += item.orderPurchaseTotalPrice * 1
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
// 申请付款
function openPayInfo() {
  proxy.$refs.payInfoDialogRef.show(form.value.piSn)
}
//   去付款
function handlePay(row) {
  console.log(row.paymentProveFileList)
  console.log(row.paymentProveFileList.length)
  // return
  if (row.paymentProveFileList.length) {
    payment({
      ...row,
      paymentStatus: 1,
      paymentId: row.paymentId,
    }).then(() => {
      proxy.$modal.msgSuccess('付款成功')
      getInfo()
    })
  } else {
    proxy.$modal.msgError('请上传付款凭证')
  }
}
//   取消付款
function handleCanclePay(row) {
  proxy.$modal.confirm('当前操作不可恢复，是否确认拒绝付款？').then(function () {
    payment({
      paymentStatus: 2,
      paymentId: row.paymentId,
    }).then(() => {
      proxy.$modal.msgSuccess('保存成功')
      getInfo()
    })
  })
}
</script>

<style lang="scss">
/* style */
.order-detail {
  background: #eee;
  .brand {
    margin-left: 20px;
    font-size: 18px;
    font-weight: 400;
    line-height: 40px;
  }
  .inquiryInfo {
    .brandInfo {
      span {
        display: inline-block;
        line-height: 50px;
        vertical-align: middle;
      }
    }
    .inquiryDescription {
      width: 500px;
      display: inline-block;
      vertical-align: middle;
    }
  }
  .descriptions-content {
    text-decoration: underline;
  }
  .right {
    position: absolute;
    top: 0;
    right: 0;
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
  .btn-box {
    padding-top: 0;
  }
  .productList {
    .cell {
      padding: 0 4px 12px;
      overflow: visible;
    }
    .el-form-item--default .el-form-item__content > span {
      display: inline-block;
      width: 100%;
      text-align: center;
    }
  }
  .totalPrice {
    // display: flex;
    // justify-content: end;
    font-size: 16px;
    line-height: 32px;
    padding-right: 20px;
    // span {
    //   font-size: 22px;
    // }
    .blod {
      font-weight: bold;
      // font-size: 22px;
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
