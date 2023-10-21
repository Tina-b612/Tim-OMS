<template>
  <div class="purchase-order-container">
    <!-- 订单列表 -->
    <div class="purchase-order">
      <el-form
        class="queryParams"
        :model="queryParams"
        ref="queryRef"
        :inline="true"
        v-show="showSearch"
        label-position="left"
      >
        <el-form-item label="采购负责人" prop="purchaseUserId">
          <el-select
            v-model="queryParams.purchaseUserId"
            filterable
            remote
            placeholder="请输入采购负责人"
            remote-show-suffix
            :remote-method="handleSearchPurchaseUser"
            :loading="selectLoading"
          >
            <el-option
              v-for="item in purchaseUserSearchList"
              :key="item.userId"
              :label="item.nickName"
              :value="item.userId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="销售负责人" prop="salesUserId">
          <el-select
            v-model="queryParams.salesUserId"
            filterable
            clearable
            remote
            placeholder="请输入销售负责人"
            remote-show-suffix
            :remote-method="handleSearchSalesUser"
            :loading="selectLoading"
          >
            <el-option
              v-for="item in salesUserSearchList"
              :key="item.userId"
              :label="item.nickName"
              :value="item.userId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="品牌名称" prop="brandId">
          <!-- <brandSelect v-model="queryParams.brandId"></brandSelect> -->
          <el-select
            v-model="queryParams.brandId"
            filterable
            clearable
            remote
            placeholder="请输入品牌名称"
            remote-show-suffix
            :remote-method="handleSearchBrandList"
            :loading="selectLoading"
          >
            <el-option
              class="flex-center-between"
              style="width: 280px"
              v-for="item in brandSearchList"
              :key="item.brandId"
              :label="item.brandName"
              :value="item.brandId"
            >
              <img :src="item.logo || defaultLogo" style="width: 22px; height: 22px" />
              <span style="width: 120px">{{ item.brandName }}</span>
              <span style="width: 50px; color: var(--el-text-color-secondary); font-size: 12px; margin-left: 4px">
                {{ item.country || '未知国家' }}
              </span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="订单号" prop="purchaseSn">
          <el-input v-model="queryParams.purchaseSn" placeholder="请输入订单号" clearable />
        </el-form-item>
        <!-- <el-form-item label="订单状态" prop="orderState">
          <el-select v-model="queryParams.orderState" placeholder="订单状态" clearable style="width: 240px">
            <el-option v-for="dict in order_state" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item> -->
        <el-form-item label="订单状态更新时间">
          <el-date-picker
            v-model="daterangeOrderStateUpdateTime"
            style="width: 240px"
            value-format="YYYY-MM-DD"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="订单创建时间" prop="createTime">
          <el-date-picker
            v-model="createTime"
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

      <el-row :gutter="10" class="mb8 mt10">
        <el-col :span="1.5">
          <el-button type="success" icon="Plus" v-hasRole="['sales', 'admin']" @click="handleAdd">创建询价单</el-button>
        </el-col>
        <el-col :span="1.5">
          <!-- <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['system:role:export']">导出</el-button> -->
        </el-col>
        <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <div class="purchase-order-list">
        <el-tabs v-model="activeName" type="card" class="demo-tabs" @tab-click="handleTabClick">
          <el-tab-pane label="全部" name="0"></el-tab-pane>
          <el-tab-pane
            v-for="item in stateNumber"
            :label="
              item.orderStatusCount ? order_state_map[item.orderState].label + `（${item.orderStatusCount}）` : ''
            "
            :name="order_state_map[item.orderState].value"
          ></el-tab-pane>
        </el-tabs>
        <el-table v-loading="loading" :data="orderList" @row-click="handleUpdate">
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column label="订单号" align="center" prop="purchaseSn" />
          <el-table-column label="品牌" align="center" prop="brandName" />
          <el-table-column label="采购负责人" align="center" prop="purchaseUserName" />
          <el-table-column label="销售负责人" align="center" prop="salesUserName" />
          <el-table-column label="订单状态" align="center" prop="orderState">
            <template #default="scope">
              <dict-tag :options="order_state" :value="scope.row.orderState" />
            </template>
          </el-table-column>
          <!-- <el-table-column label="订单描述" align="center" prop="orderDescription" /> -->
          <el-table-column label="订单创建时间" align="center" prop="createTime" width="180">
            <template v-slot="scope">
              <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
            </template>
          </el-table-column>
          <el-table-column label="订单状态更新时间" align="center" prop="orderStateUpdateTime" width="180">
            <template v-slot="scope">
              <span>{{ parseTime(scope.row.orderStateUpdateTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
            </template>
          </el-table-column>
          <!-- <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template v-slot="scope">
            <el-button
              size="small"
              type="primary"
              link
              icon="edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['purchase:order:edit']"
            >
              修改
            </el-button>
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
import { listOrder, SearchUser, searchBrand, getPurchaseCount } from '@/api/purchase/list'
import { reactive } from 'vue'
import OrderEditDialog from './orderEditDialog'
import brandSelect from '@/views/purchase/componments/brandSelect'
import omsMessage from '../componments/omsMessage'

import defaultLogo from '@/assets/images/default.png'

const activeName = ref('0')

const handleTabClick = (tab) => {
  queryParams.value.orderState = tab.paneName
  getList()
}

const { proxy } = getCurrentInstance()
const { order_state } = proxy.useDict('order_state')

const route = useRoute()
watch(route, () => {
  if (proxy.$route.path === '/purchase/list') {
    getList()
  }
})

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
const order_state_map = ref({})
function getStateNumber() {
  getPurchaseCount().then((res) => {
    order_state_map.value = order_state.value.reduce((target, key, index) => {
      target[key.value] = key
      return target
    }, {})
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
  listOrder(proxy.addDateRange(pramers, createTime.value, 'CreateTime'))
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
  // dialogTitle.value = "新增订单"
  // proxy.$refs["orderEditDialogRef"].show();
  proxy.$router.push({ name: 'Purchase/detail' })
}
/** 修改按钮操作 */
function handleUpdate(row) {
  proxy.$router.push({ name: 'Purchase/detail', query: { id: row.purchaseId } })
}

const selectLoading = ref(false)
// 搜索采购员
const purchaseUserSearchList = ref([])
function handleSearchPurchaseUser(userName) {
  if (userName) {
    selectLoading.value = true
    SearchUser({ purchaseNickName: userName }).then((response) => {
      selectLoading.value = false
      purchaseUserSearchList.value = response.rows.filter((item) => {
        return {
          label: item.nickName,
          velue: item.userId,
        }
      })
    })
  }
}
// 搜索销售员
const salesUserSearchList = ref([])
function handleSearchSalesUser(userName) {
  if (userName) {
    selectLoading.value = true
    SearchUser({ salesNickName: userName }).then((response) => {
      selectLoading.value = false
      salesUserSearchList.value = response.rows
    })
  }
}
// brandList 搜索品牌
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

getList()
</script>

<style lang="scss">
.purchase-order-container {
  display: flex;
  height: 100%;
  // overflow: scroll;
  .queryParams {
    background: #fff;
    padding: 15px;
  }
  .purchase-order-list {
    background: #fff;
    padding: 20px 10px;
  }
  .purchase-order {
    position: relative;
    padding: 20px;
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
