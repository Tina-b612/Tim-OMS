<template>
  <div class="inquiry-container">
    <!-- 询盘列表 -->
    <div class="inquiry-order">
      <!-- 搜索面板 -->
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-position="left">
        <el-form-item label="采购负责人" prop="inquiryPurchaseUserId">
          <simple-select
            v-model="queryParams.brandResponsibleUserId"
            :remoteFunction="searchUser"
            searchKey="nickName"
            searchValue="userId"
            placeholder="请输入采购负责人名称"
          />
        </el-form-item>
        <el-form-item label="销售负责人" prop="inquirySalesUserId">
          <simple-select
            v-model="queryParams.brandResponsibleUserId"
            :remoteFunction="searchUser"
            searchKey="nickName"
            searchValue="userId"
            placeholder="请输入销售负责人名称"
          />
        </el-form-item>
        <el-form-item label="品牌" prop="brandId">
          <simple-select
            v-model="queryParams.brandId"
            :remoteFunction="searchBrand"
            searchKey="brandName"
            searchValue="brandId"
            placeholder="请输入品牌名称"
          />
        </el-form-item>
        <el-form-item label="询盘单号" prop="inquirySn">
          <el-input
            v-model="queryParams.inquirySn"
            placeholder="请输入询盘单号"
            clearable
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="订单状态更新时间" prop="inquiryStateUpdateTime">
          <el-date-picker
            v-model="queryParams.inquiryStateUpdateTime"
            style="width: 240px"
            value-format="YYYY-MM-DD"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="订单创建时间" prop="inquiryCreateTime">
          <el-date-picker
            v-model="queryParams.inquiryCreateTime"
            style="width: 240px"
            value-format="YYYY-MM-DD"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          ></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="search" @click="handleQuery">搜索</el-button>
          <el-button icon="refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
      <!-- 操作按钮 -->
      <el-row :gutter="10" class="mb8 mt10">
        <el-col :span="1.5">
          <el-button type="success" icon="Plus" v-hasRole="['sales', 'admin']" @click="handleAdd">创建询盘</el-button>
        </el-col>
        <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>
      <!-- 列表区域 -->
      <div class="inquiry-order-list">
        <!-- 列表分类 -->
        <el-tabs v-model="activeName" type="card" class="demo-tabs" @tab-click="handleTabClick">
          <el-tab-pane label="全部" name=""></el-tab-pane>
          <el-tab-pane
            v-for="item in stateNumber"
            :label="
              item.inquiryStatusCount
                ? inquiry_status_map[item.inquiryStatus].label + `（${item.inquiryStatusCount}）`
                : ''
            "
            :name="inquiry_status_map[item.inquiryStatus].value"
          ></el-tab-pane>
        </el-tabs>
        <!-- 列表 -->
        <el-table v-loading="loading" :data="orderList" @row-click="handleUpdate">
          <!-- <el-table-column type="index" label="序号" width="60" /> -->
          <el-table-column label="询盘单号" align="center" prop="inquirySn" />
          <el-table-column label="品牌" align="center" prop="brandName" />
          <el-table-column label="采购负责人" align="center" prop="purchaseUserName" />
          <el-table-column label="销售负责人" align="center" prop="salesUserName" />
          <el-table-column label="未税总价" align="center" prop="inquiryTotalPriceNoTax" />
          <el-table-column label="订单状态" align="center" prop="inquiryStatus">
            <template #default="scope">
              <dict-tag :options="inquiry_status" :value="scope.row.inquiryStatus" />
            </template>
          </el-table-column>
          <el-table-column label="订单创建时间" align="center" prop="inquiryCreateTime" width="180">
            <template v-slot="scope">
              <span>{{ parseTime(scope.row.inquiryCreateTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
            </template>
          </el-table-column>
          <el-table-column label="订单状态更新时间" align="center" prop="inquiryStatusUpdateTime" width="180">
            <template v-slot="scope">
              <span>{{ parseTime(scope.row.inquiryStatusUpdateTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
            </template>
          </el-table-column>
          <!-- <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template v-slot="scope">
              <el-button size="small" type="primary" link icon="edit" @click="handleUpdate(scope.row)">查看</el-button>
            </template>
          </el-table-column> -->
        </el-table>

        <pagination
          v-show="total > 0"
          :total="total"
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          @pagination="getList"
        />
      </div>
    </div>

    <!-- 消息面板 -->
    <div class="message-containar">
      <omsMessage></omsMessage>
    </div>

    <!-- 添加或修改订单功能对话框 -->
    <OrderEditDialog ref="orderEditDialogRef" :title="dialogTitle" :open="true" @ok="handleQuery"></OrderEditDialog>
  </div>
</template>

<script setup name="List">
import { searchUser, searchBrand } from '@/api/brand'
import { listInquiry, getInquiryCount, getInquiry, delInquiry, addInquiry, updateInquiry } from '@/api/inquiry'
import { reactive } from 'vue'
import OrderEditDialog from './orderEditDialog'
import omsMessage from '@/views/componments/omsMessage'
import SimpleSelect from '@/components/SimpleSelect'

import defaultLogo from '@/assets/images/default.png'

const activeName = ref('')

const { proxy } = getCurrentInstance()
const { inquiry_status } = proxy.useDict('inquiry_status')

const route = useRoute()
console.log(route.query.orderstatus)

const loading = ref(true)
// 显示搜索条件
const showSearch = ref(true)
// 总条数
const total = ref(0)
// 订单功能表格数据
const orderList = ref([])
// 订单状态更新时间范围
const daterangeOrderStateUpdateTime = ref([])
// 订单创建时间范围
const createTime = ref([])
const dialogTitle = ref('')

const data = reactive({
  // 表单参数
  form: {
    brandId: 1,
    orderDescription: '订单描述',
    timProductList: [
      {
        modelName: 21323,
        modelId: '型号id',
        orderNumber: 21321434,
        productDescription: '产品描述产品描述产品描述产品描述',
        quantity: 1,
        salesAttachmentList: [],
      },
    ],
  },

  // 查询参数
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    purchaseUserId: null,
    salesUserId: null,
    brandId: null,
    purchaseSn: null,
    orderState: null,
    orderStateUpdateTime: null,
    supplierId: null,
    updateTime: null,
    createTime: null,
  },
  // 表单校验
  rules: {
    brandId: [{ required: true, message: '请选择品牌', trigger: 'blur' }],
    timProductList: [
      { required: true, message: '请输入产品型号' },
      {
        validator: (rule, value, callback) => {
          for (let i = 0; i < value.length; i++) {
            const item = value[i]
            if (!item.modelName) {
              return callback(new Error('请输入产品型号'))
            }
          }
          callback()
        },
        trigger: 'blur',
      },
    ],
  },
})
const { queryParams, form, rules } = toRefs(data)

// 查询订单状态数量
const stateNumber = ref([])
const inquiry_status_map = ref({})
function getStateNumber() {
  getInquiryCount().then((res) => {
    inquiry_status_map.value = inquiry_status.value.reduce((target, key, index) => {
      target[key.value] = key
      return target
    }, {})
    res.data.sort((a, b) => {
      return a.inquiryState - b.inquiryState
    })
    stateNumber.value = res.data
  })
}

/** 查询订单功能列表 */
function getList() {
  loading.value = true
  let pramers = proxy.addDateRange(
    queryParams.value,
    daterangeOrderStateUpdateTime.value,
    'daterangeOrderStateUpdateTime'
  )
  listInquiry(proxy.addDateRange(pramers, createTime.value, 'CreateTime'))
    .then((response) => {
      orderList.value = response.rows
      total.value = response.total
      loading.value = false

      getStateNumber()
    })
    .catch(() => {
      loading.value = false
    })
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}
/** 重置按钮操作 */
function resetQuery() {
  daterangeOrderStateUpdateTime.value = []
  createTime.value = []
  proxy.resetForm('queryRef')
  handleQuery()
}

/** 新增按钮操作 */
function handleAdd() {
  proxy.$router.push({ path: 'inquiry/add' })
}
/** 修改按钮操作 */
function handleUpdate(row) {
  proxy.$router.push({ path: 'inquiry/edit', query: { id: row.inquiryId } })
}

// onBeforeMount(() => {
//   let status = route.query.status
//   queryParams.value.inquiryStatus = status
//   getList()
// })

const handleTabClick = (tab) => {
  // queryParams.value.inquiryStatus = tab.paneName
  // getList()

  proxy.$router.push({ path: 'inquiry', query: { status: tab.paneName } })
}

watch(
  () => route.query.status,
  (newValue, oldValue) => {
    console.log('watch', newValue)
    queryParams.value.inquiryStatus = newValue || ''
    activeName.value = newValue || ''
    getList()
  },
  { immediate: true }
)

// getList()
</script>

<style lang="scss">
.inquiry-container {
  display: flex;
  height: 100%;
  background: #eee;
  .inquiry-order {
    position: relative;
    padding: 20px;
    background: #fff;
    margin-right: 10px;
    overflow: auto;
    .pagination-container .el-pagination {
      right: 40px;
    }
  }
  .message-containar {
    width: 25%;
    max-width: 350px;
    flex-shrink: 0;
    // margin-left: 20px;
    box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.12);
  }
}
</style>
