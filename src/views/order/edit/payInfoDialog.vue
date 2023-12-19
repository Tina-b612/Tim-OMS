<template>
  <el-dialog title="付款申请表" v-model="open" width="1300px" v-if="open" append-to-body>
    <el-form ref="formRef" :model="form" :rules="rules">
      <el-form-item label="用途（PI）" prop="piSn">
        <el-input v-model="form.piSn" placeholder="请输入PI号" style="width: 300px" />
      </el-form-item>
      <el-table
        :data="form.paymentList"
        border
        :header-cell-style="{ 'text-align': 'center' }"
        :cell-style="{ 'text-align': 'center' }"
        style="width: 100%"
      >
        <el-table-column type="index" width="60" label="序号" fixed="left" />
        <el-table-column prop="supplierId" label="供应商" width="150" v-hasRole="['purchase', 'purchaseAdmin']">
          <template #header>
            <span class="danger">*</span>
            供应商
          </template>
          <template #default="scope">
            <el-form-item :prop="'paymentList.' + scope.$index + '.supplier'" :rules="valueRule">
              <el-select
                v-model="scope.row.supplier"
                filterable
                default-first-option
                clearable
                remote
                placeholder="请输入供应商名称"
                remote-show-suffix
                @change="handleChangeSelect(scope.$index)"
              >
                <el-option
                  style="width: 280px"
                  v-for="item in ordersupplierList"
                  :label="item.supplierName"
                  :key="item.supplierId"
                  :value="item"
                >
                  <span style="width: 100px">{{ item.supplierName }}</span>
                </el-option>
              </el-select>
            </el-form-item>
          </template>
        </el-table-column>
        <!-- <el-table-column prop="paymentPayeeName" label="收款单位">
          <template #header>
            <span class="danger">*</span>
            收款单位
          </template>
          <template #default="scope">
            <el-form-item :prop="'paymentList.' + scope.$index + '.paymentPayeeName'" :rules="valueRule">
              <el-input v-model="scope.row.paymentPayeeName"></el-input>
            </el-form-item>
          </template>
        </el-table-column> -->
        <el-table-column prop="paymentBankName" label="开户行">
          <template #default="scope">
            <el-form-item>
              <el-input v-model="scope.row.paymentBankName"></el-input>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column prop="paymentPayeeAccount" label="收款账号/采购账号" width="240">
          <template #header>
            <span class="danger">*</span>
            收款账号/采购账号
          </template>
          <template #default="scope">
            <el-form-item :prop="'paymentList.' + scope.$index + '.paymentPayeeAccount'" :rules="valueRule">
              <el-input v-model="scope.row.paymentPayeeAccount"></el-input>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column prop="paymentAmount" label="金额">
          <template #header>
            <span class="danger">*</span>
            金额
          </template>
          <template #default="scope">
            <el-form-item :prop="'paymentList.' + scope.$index + '.paymentAmount'" :rules="valueRule">
              <el-input v-model="scope.row.paymentAmount"></el-input>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column prop="paymentMethod" label="付款途径">
          <template #default="scope">
            <el-form-item>
              <el-input v-model="scope.row.paymentMethod"></el-input>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column prop="paymentDescription" label="备注">
          <template #default="scope">
            <el-form-item>
              <el-input v-model="scope.row.paymentDescription"></el-input>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column prop="paymentContractFileList" label="上传盖章合同" width="230">
          <template #header>
            <span class="danger">*</span>
            上传盖章合同
          </template>
          <template #default="scope">
            <el-form-item :prop="'paymentList.' + scope.$index + '.paymentContractFileList'" :rules="valueRule">
              <el-upload
                v-model:file-list="scope.row.paymentContractFileList"
                :action="base + '/system/info/add'"
                :limit="1"
                :headers="headers"
                accept=".jpg, .jpeg, .png, .doc, .docx, .xls, .xlsx, .pdf"
                :on-success="handleUploadSuccess"
                :on-preview="handleFilePreview"
              >
                <!-- <el-button type="primary" :disabled="!scope.row.edit">上传附件</el-button> -->
                <el-icon><Plus /></el-icon>
              </el-upload>
            </el-form-item>
          </template>
        </el-table-column>
      </el-table>
    </el-form>
    <div slot="footer" class="dialog-footer flex-center mt20">
      <el-button type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { deepClone } from '@/utils/index'
import { getToken } from '@/utils/auth'
import { getSupplier } from '@/api/supplier'

const { proxy } = getCurrentInstance()
const emit = defineEmits()
const base = import.meta.env.VITE_APP_BASE_API
const headers = ref({ Authorization: 'Bearer ' + getToken() })

const props = defineProps({
  ordersupplierList: Array,
})

// 是否显示弹出层
const open = ref(false)
let payment = {
  paymentPayeeName: '',
  paymentBankName: '',
  paymentPayeeAccount: '',
  paymentAmount: '',
  paymentMethod: '',
  paymentDescription: '',
  paymentContractFileList: [],
}
// 表单参数
const form = ref({
  piSn: '',
  paymentList: [deepClone(payment)],
})
// 表单校验
const rules = {
  piSn: [{ required: true, message: 'PI号不能为空', trigger: 'blur' }],
}
const valueRule = { required: true, message: '请输入', trigger: 'change' }

function show(piSn) {
  open.value = true
  form.value.piSn = piSn
}

// 选择供应商
function handleChangeSelect(index) {
  console.log(index)
  let item = form.value.paymentList[index]
  if (item.supplierId) {
    getSupplier(item.supplierId).then((response) => {
      form.value.paymentList[index].paymentBankName = response.data.supplierBankName || ''
      form.value.paymentList[index].supplierName = response.data.supplierName || ''
      form.value.paymentList[index].paymentPayeeAccount = response.data.supplierPayeeAccount || ''
    })
  }
}

// 取消按钮
function cancel() {
  open.value = false
  // reset()
}

/** 提交按钮 */
function submitForm() {
  console.log(form.value)
  proxy.$refs['formRef'].validate((valid) => {
    if (valid) {
      emit('submit', 2, form.value.paymentList)
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
defineExpose({
  show,
})
</script>

<style>
/* style */
.danger {
  color: var(--el-color-danger);
}
</style>
