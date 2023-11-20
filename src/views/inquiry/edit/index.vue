<template>
  <div class="common-layout purchase-order-detail">
    <el-container>
      <el-main class="purchase-order-main">
        <el-scrollbar height="100%" view-style="padding:5px 20px 20px;">
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
            <!--  切换订单暂时没做 -->
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
              <el-button
                type="primary"
                v-hasRole="['purchase', 'purchaseAdmin']"
                v-show="[1, 2].includes(inquiryStatus)"
                @click="submitForm(inquiryStatus)"
              >
                暂存报价
              </el-button>
              <el-button
                type="primary"
                v-hasRole="['purchase', 'purchaseAdmin']"
                v-show="[1, 2].includes(inquiryStatus)"
                @click="submitForm(3)"
              >
                确认报价
              </el-button>
              <el-button
                type="success"
                v-show="
                  (inquiryStatus === 3 && proxy.$auth.hasRoleOr('purchase', 'purchaseAdmin')) ||
                  [1, 2].includes(inquiryStatus)
                "
                @click="pageEdit = true"
              >
                编辑
              </el-button>
              <el-button type="success" @click="submitForm(0)" v-if="!inquiryStatus">保存为草稿</el-button>
              <el-button type="success" @click="submitForm(1)" v-if="!inquiryStatus">发送询价</el-button>
              <el-button
                type="success"
                @click="submitForm(4)"
                v-if="[3].includes(inquiryStatus) && proxy.$auth.hasRoleOr('sales', 'salesAdmin')"
              >
                申请采购
              </el-button>
              <el-button type="danger" @click="submitForm(5)" v-if="inquiryStatus < 3">取消</el-button>
            </div>
          </el-row>
          <!-- 表单 -->
          <el-form ref="orderRef" :model="form" :rules="rules" label-width="80px" class="orderForm" :disabled="false">
            <!-- 品牌 -->
            <div class="mt20">
              <!-- <div class="brand flex-center-left" v-if="form.rtBrand">
                <span>品牌：</span>
                <el-avatar shape="square" :src="form.rtBrand.brandLogo">
                  <img src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png" />
                </el-avatar>
                <span class="ml20">{{ form.rtBrand.brandName }}</span>
              </div>
              <div v-if="!pageEdit && !!inquiryStatus">
                <span>询盘描述：</span>
                <span>{{ form.inquiryDescription }}</span>
              </div> -->
              <el-descriptions size="large" class="ml20 inquiryInfo" style="width: 800px" :column="2">
                <el-descriptions-item label="品牌" class-name="brandInfo">
                  <div v-if="form.rtBrand" style="display: inline-block">
                    <el-avatar shape="square" :src="form.rtBrand.brandLogo">
                      <img src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png" />
                    </el-avatar>
                    <span class="ml10">{{ form.rtBrand.brandName }}</span>
                  </div>
                </el-descriptions-item>
                <el-descriptions-item label="PI号" v-if="inquiryStatus > 3">
                  {{ form.piSn }}
                </el-descriptions-item>
                <el-descriptions-item
                  label="询盘描述"
                  class-name="inquiryDescription"
                  v-if="!pageEdit && !!inquiryStatus"
                >
                  {{ form.inquiryDescription }}
                </el-descriptions-item>
              </el-descriptions>

              <el-form-item
                class="mt20"
                label="询盘描述"
                prop="inquiryDescription"
                v-if="!inquiryStatus || (pageEdit && ![5, 7].includes(inquiryStatus))"
              >
                <el-input
                  :rows="3"
                  type="textarea"
                  maxlength="255"
                  show-word-limit
                  v-model="form.inquiryDescription"
                  placeholder="请输入询盘描述"
                />
              </el-form-item>

              <el-form-item
                size="large"
                class="mt20"
                label="PI号"
                prop="piSn"
                v-if="inquiryStatus === 3 && proxy.$auth.hasRoleOr('sales', 'salesAdmin')"
              >
                <el-input v-model="form.piSn" placeholder="请输入PI号" />
              </el-form-item>
            </div>
            <!-- 合计 -->
            <el-row :gutter="20" v-if="inquiryStatus >= 3 || proxy.$auth.hasRoleOr('purchase', 'purchaseAdmin')">
              <el-col :span="12" class="total-price-left">
                <el-card class="total-price-content" header="本单合计">
                  <!-- <h3 class="ml20">本单合计</h3> -->
                  <div class="flex-center-left ml20 totalPrice" v-if="![0].includes(inquiryStatus)">
                    <div>未税总价：¥ {{ form.inquiryTotalPriceNoTax || 0 }}</div>
                    <div class="ml20">税金：¥ {{ form.inquiryTax || 0 }}</div>
                    <div class="ml20">总价：¥ {{ form.inquiryTotalPrice || 0 }}</div>
                  </div>
                  <div class="flex-center-left mt10">
                    <el-form-item label="税率" prop="inquiryTaxRate" v-if="![0].includes(inquiryStatus)">
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
                        v-if="
                          proxy.$auth.hasRoleOr('purchase', 'purchaseAdmin') &&
                          (pageEdit || [1, 2].includes(inquiryStatus))
                        "
                        v-model="form.inquiryTaxRate"
                        style="width: 130px"
                        @input="getTotalPrice"
                      >
                        <template #append>%</template>
                      </el-input>
                      <span v-else>{{ form.inquiryTaxRate || 0 }} %</span>
                    </el-form-item>
                    <el-form-item label="杂费" prop="inquiryOtherFee" v-if="![0].includes(inquiryStatus)">
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
                      <span class="mr10">¥</span>
                      <el-input-number
                        v-if="
                          proxy.$auth.hasRoleOr('purchase', 'purchaseAdmin') &&
                          (pageEdit || [1, 2].includes(inquiryStatus))
                        "
                        v-model="form.inquiryOtherFee"
                        style="width: 150px"
                        :controls="false"
                        :precision="4"
                        @change="getTotalPrice"
                      >
                        <template #append>元</template>
                      </el-input-number>
                      <span v-else>¥ {{ form.inquiryOtherFee || 0 }}</span>
                    </el-form-item>
                  </div>
                </el-card>
              </el-col>
              <el-col
                :span="12"
                class="total-price-right"
                v-if="proxy.$auth.hasRoleOr('sales', 'salesAdmin') || [3].includes(inquiryId)"
              >
                <el-card class="total-price-content" header="勾选产品合计">
                  <!-- <h3 class="ml20">勾选产品合计</h3> -->
                  <div class="ml20 totalPrice" v-if="![0].includes(inquiryStatus)">
                    <el-row :gutter="20">
                      <el-col :span="12">
                        <div>已选产品件数：¥ {{ form.inquirySelectedCount || 0 }}</div>
                        <div>已选产品总计：¥ {{ form.inquirySelectedTotalProducts || 0 }}</div>
                      </el-col>
                      <el-col :span="12">
                        <div>未税总价：¥ {{ form.inquirySelectedTotalPriceNoTax || 0 }}</div>
                        <div>税金：¥ {{ form.inquirySelectedTax || 0 }}</div>
                        <div class="primary blod">已选产品总价：¥ {{ form.inquirySelectedTotalPrice || 0 }}</div>
                      </el-col>
                    </el-row>
                  </div>
                </el-card>
              </el-col>
            </el-row>

            <!-- 
          <p>{{ ![0].includes(inquiryStatus) }}</p>
          <p>{{ proxy.$auth.hasRoleOr('purchase', 'purchaseAdmin') && pageEdit }}</p> -->
            <div class="mt20">
              <el-form-item label="订单状态" v-if="form.orderList">
                <el-table
                  :data="form.orderList"
                  border
                  class="productList"
                  :header-cell-style="{ 'text-align': 'center' }"
                  :cell-style="{ 'text-align': 'center' }"
                  style="width: 400px"
                >
                  <!-- <el-table-column type="index" width="50" label="序号" fixed="left" /> -->
                  <el-table-column label="订单号" prop="orderSn" />
                  <el-table-column label="订单状态" prop="orderStatus">
                    <template #default="scope">
                      <dict-tag style="display: inline" :options="order_status" :value="scope.row.orderStatus" />
                    </template>
                  </el-table-column>
                </el-table>
              </el-form-item>
              <el-form-item label="产品明细">
                <el-table
                  ref="productListRef"
                  :data="form.productList"
                  border
                  class="productList"
                  :header-cell-style="{ 'text-align': 'center' }"
                  :cell-style="{ 'text-align': 'center' }"
                  style="width: 100%"
                  @selection-change="handleSelectionChange"
                >
                  <!-- :selectable="selectable"  -->
                  <el-table-column type="selection" width="55" v-if="inquiryStatus === 3" />
                  <!-- <el-table-column type="index" width="50" label="序号" fixed="left" /> -->
                  <el-table-column prop="productName" label="型号" fixed="left" :width="pageEdit ? 150 : 'auto'">
                    <template #default="scope">
                      <el-form-item :prop="'productList.' + scope.$index + '.productName'" :rules="valueRule">
                        <el-input
                          v-model="scope.row.productName"
                          placeholder="请输入产品型号"
                          v-if="scope.row.edit || inquiryStatus === 0"
                        ></el-input>
                        <span v-else>{{ scope.row.productName }}</span>
                      </el-form-item>
                    </template>
                  </el-table-column>
                  <el-table-column
                    prop="productDescription"
                    label="产品描述"
                    :show-overflow-tooltip="true"
                    :width="proxy.$auth.hasRoleOr('purchase', 'purchaseAdmin') && pageEdit ? 160 : 'auto'"
                  >
                    <template #default="scope">
                      <el-input
                        v-model="scope.row.productDescription"
                        placeholder="请输入产品描述"
                        v-if="scope.row.edit || inquiryStatus === 0"
                      ></el-input>
                      <span v-else>{{ scope.row.productDescription }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column
                    prop="productQuantity"
                    label="数量"
                    :width="proxy.$auth.hasRoleOr('purchase', 'purchaseAdmin') && pageEdit ? 160 : 'auto'"
                  >
                    <template #default="scope">
                      <el-input-number
                        v-model="scope.row.productQuantity"
                        :controls="false"
                        :precision="0"
                        :min="1"
                        v-if="scope.row.edit || inquiryStatus === 0"
                        @change="getPurchaseTotalPrice(scope.row)"
                      ></el-input-number>
                      <span v-else>{{ scope.row.productQuantity }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="salesFileList" label="销售附件" width="150">
                    <template #default="scope">
                      <el-upload
                        v-if="scope.row.edit || inquiryStatus === 0"
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
                  <el-table-column
                    prop="supplierId"
                    label="供应商"
                    width="150"
                    v-hasRole="['purchase', 'purchaseAdmin', 'manager']"
                  >
                    <template #default="scope">
                      <el-form-item :prop="'productList.' + scope.$index + '.supplierId'" :rules="valueRule">
                        <simple-select-local
                          v-if="inquiryStatus < 3 || scope.row.edit"
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
                    prop="productPurchaseMethod"
                    label="采购方式"
                    v-if="inquiryStatus >= 3 || proxy.$auth.hasRoleOr('purchase', 'purchaseAdmin')"
                    width="100"
                  >
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
                    prop="productPurchasePrice"
                    label="未税单价"
                    v-if="inquiryStatus >= 3 || proxy.$auth.hasRoleOr('purchase', 'purchaseAdmin')"
                    width="100"
                  >
                    <template #default="scope">
                      <el-form-item :prop="'productList.' + scope.$index + '.productPurchasePrice'" :rules="valueRule">
                        <el-input-number
                          v-if="inquiryStatus < 3 || scope.row.edit"
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
                    v-if="inquiryStatus >= 3 || proxy.$auth.hasRoleOr('purchase', 'purchaseAdmin')"
                    width="100"
                  >
                    <template #default="scope">
                      <el-form-item>
                        <el-input-number
                          v-if="inquiryStatus < 3 || scope.row.edit"
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
                    v-if="inquiryStatus >= 3 || proxy.$auth.hasRoleOr('purchase', 'purchaseAdmin')"
                    width="100"
                  >
                    <!-- <template #default="scope">
                    <span>{{ scope.row.productPurchasePrice * scope.row.productQuantity }}</span>
                  </template> -->
                  </el-table-column>
                  <el-table-column
                    prop="productDeliveryTime"
                    label="预计货期"
                    v-if="inquiryStatus >= 3 || proxy.$auth.hasRoleOr('purchase', 'purchaseAdmin')"
                    width="100"
                  >
                    <template #default="scope">
                      <el-form-item>
                        <el-input
                          v-if="inquiryStatus < 3 || scope.row.edit"
                          v-model="scope.row.productDeliveryTime"
                        ></el-input>
                        <span v-else>{{ scope.row.productDeliveryTime }}</span>
                      </el-form-item>
                    </template>
                  </el-table-column>
                  <el-table-column
                    prop="purchaseFileList"
                    label="采购附件"
                    v-if="inquiryStatus >= 3 || proxy.$auth.hasRoleOr('purchase', 'purchaseAdmin')"
                    width="150"
                  >
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
                          <!-- {{ item.fileName }} -->
                          <a :href="item.url" target="_blank" rel="noopener noreferrer">{{ item.fileName }}</a>
                        </div>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column label="产品状态" prop="productType" v-if="inquiryStatus >= 3">
                    <template #default="scope">
                      <dict-tag style="display: inline" :options="product_status" :value="scope.row.productType" />
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="操作"
                    align="center"
                    width="150"
                    fixed="right"
                    v-if="
                      (inquiryStatus === 3 && proxy.$auth.hasRoleOr('purchase', 'purchaseAdmin')) ||
                      [0, 1, 2].includes(inquiryStatus)
                    "
                  >
                    <template #default="scope">
                      <!-- <el-tooltip
                        content="历史成交价"
                        placement="top"
                        v-if="scope.row.productId && ![0].includes(inquiryStatus) && proxy.$auth.hasRoleOr('purchase', 'purchaseAdmin')"
                      >
                        <el-button
                          link
                          type="primary"
                          icon="Clock"
                          :disabled="![1, 2].includes(inquiryStatus) || !scope.row.btnEdit"
                          @click="getHistory(scope.row)"
                        ></el-button> 
                      </el-tooltip> -->

                      <el-popover
                        placement="top"
                        title="历史成交价"
                        width="800"
                        trigger="click"
                        v-if="
                          scope.row.productId &&
                          ![0].includes(inquiryStatus) &&
                          proxy.$auth.hasRoleOr('purchase', 'purchaseAdmin')
                        "
                      >
                        <template #reference>
                          <el-button
                            link
                            type="primary"
                            icon="Clock"
                            :disabled="![1, 2].includes(inquiryStatus) || !scope.row.btnEdit"
                            @click="getHistory(scope.row)"
                          ></el-button>
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
                      <el-tooltip
                        content="编辑"
                        placement="top"
                        v-if="scope.row.productId && ![0].includes(inquiryStatus)"
                      >
                        <el-button
                          link
                          type="primary"
                          icon="Edit"
                          :disabled="!pageEdit || !scope.row.btnEdit"
                          @click="handleEditProduct(scope.$index)"
                        ></el-button>
                      </el-tooltip>
                      <el-tooltip content="删除" placement="top" v-if="[0].includes(inquiryStatus)">
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
              v-show="pageEdit || [0].includes(inquiryStatus)"
              :disabled="btnAddDiabled"
              type="primary"
              @click="handleAddProduct()"
            >
              添加产品
            </el-button>
          </el-row>
        </el-scrollbar>
      </el-main>
      <el-aside class="message-containar">
        <orderMessage :id="inquiryId" :inquirySn="form.inquirySn" ref="orderMessageRef"></orderMessage>
      </el-aside>
    </el-container>
  </div>
</template>

<script setup name="Detail">
import { getInquiry, updateInquiry, editInquiryStatus, quotedHistory } from '@/api/inquiry'
import { delProduct } from '@/api/product'
import { delFile } from '@/api/system/info'
import { nextTick, onBeforeMount, reactive } from 'vue'
import orderMessage from './orderMessage'
import { deepClone } from '@/utils/index'
import SimpleSelectLocal from '@/components/SimpleSelectLocal'

import { getToken } from '@/utils/auth'
import useUserStore from '@/store/modules/user'
import { getFloat } from '@/utils/index'
const user = useUserStore()
const loading = ref(false)
const { proxy } = getCurrentInstance()
const { inquiry_status } = proxy.useDict('inquiry_status')
const { order_status } = proxy.useDict('order_status')
const { product_status } = proxy.useDict('product_status')
const inquiryStatus = ref(0)
const inquiryId = proxy.$route.query.id
const base = import.meta.env.VITE_APP_BASE_API
const headers = ref({ Authorization: 'Bearer ' + getToken() })
const timingTimeStr = ref('')
const pageEdit = ref(false)
const quoted = ref(false)
const btnAddDiabled = ref(false)
const updatedProductId = ref(null)
const originData = ref({})
const multipleSelection = ref([])

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
  if (inquiryId) {
    getInfo()
  }
})

// 计算产品采购总价
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
  form.value.inquiryTotalPriceNoTax = getFloat(price, 4)
  // 税金
  form.value.inquiryTax = getFloat((form.value.inquiryTotalPriceNoTax * form.value.inquiryTaxRate) / 100, 4)
  // 总价
  let TotalPrice = form.value.inquiryTotalPriceNoTax * 1 + form.value.inquiryOtherFee * 1
  form.value.inquiryTotalPrice = getFloat(TotalPrice, 4)
}

// 获取当前询盘信息
function getInfo() {
  getInquiry(inquiryId).then((res) => {
    let data = res.data
    inquiryStatus.value = data.inquiryStatus

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
        return item
      })
    }

    nextTick(() => {
      originData.value = data
      form.value = deepClone(originData.value)
      loading.value = true
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
  proxy.$modal.confirm('当前操作不可恢复，是否确认删除型号为"' + item.productName + '"产品?').then(function () {
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
function submitForm(inquiryStatus) {
  if (inquiryStatus === 5) {
    proxy.$modal.confirm('当前操作不可恢复，是否确认取消订单？').then(() => {
      editInquiryStatus({ ...form.value, inquiryStatus }).then((response) => {
        proxy.$modal.msgSuccess('保存成功')
        proxy.$tab.closeOpenPage({ path: '/inquiry' })
      })
    })
    return
  }
  proxy.$refs['orderRef'].validate((valid) => {
    if (valid) {
      if (inquiryStatus === 4) {
        console.log(multipleSelection.value)
        if (!multipleSelection.value.length) {
          return proxy.$modal.msgError('请选择下单产品')
        }
        if (!form.value.piSn) {
          return proxy.$modal.msgError('请输入PI号')
        }
        form.value.selectedProductList = multipleSelection.value
      }
      editInquiryStatus({ ...form.value, inquiryStatus }).then((response) => {
        proxy.$modal.msgSuccess('保存成功')
        proxy.$tab.closeOpenPage({ path: '/inquiry' })
      })
    }
  })
}

// 保存编辑
function handleSave() {
  proxy.$refs['orderRef'].validate((valid) => {
    if (valid) {
      form.value.inquiryStatus = inquiryStatus
      updateInquiry({ ...form.value, updatedProductId: updatedProductId.value }).then((response) => {
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
</script>

<style lang="scss">
/* style */
.purchase-order-detail {
  background: #eee;
  height: 100%;

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

  .el-container {
    height: 100%;
  }
  .brand {
    margin-left: 20px;
    font-size: 18px;
    font-weight: 400;
    line-height: 40px;
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
      padding: 0 4px 8px;
      // overflow: visible;/
      .el-table td.el-table__cell div {
        overflow: visible;
      }
      .el-form-item--default .el-form-item__content > span {
        display: inline-block;
        width: 100%;
        text-align: center;
      }
    }
  }

  .totalPrice {
    // display: flex;
    // justify-content: end;
    // font-size: 16px;
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
      height: 170px;
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
    // padding-top: 5px;
    padding: 0;
    height: 100%;
    // overflow: auto;
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
