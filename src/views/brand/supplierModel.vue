<template>
  <el-dialog v-model="open" width="700px" style="padding: 0 20px 20px" v-if="open" append-to-body>
    <el-descriptions :title="data.supplierName" :column="2" border>
      <el-descriptions-item :min-width="90" label="供应商名称">{{ data.supplierName }}</el-descriptions-item>
      <el-descriptions-item :min-width="90" label="联系人">{{ data.supplierContactName }}</el-descriptions-item>
      <el-descriptions-item :min-width="90" label="联系电话">{{ data.supplierContactPhone }}</el-descriptions-item>
      <el-descriptions-item :min-width="90" label="email">{{ data.supplierEmail }}</el-descriptions-item>
      <el-descriptions-item :min-width="90" label="地址">{{ data.supplierAddress }}</el-descriptions-item>
      <el-descriptions-item :min-width="90" label="网址">{{ data.supplierWeb }}</el-descriptions-item>
      <el-descriptions-item :min-width="90" label="微信">{{ data.supplierWechat }}</el-descriptions-item>
      <el-descriptions-item :min-width="90" label="支付宝">{{ data.supplierZhifubao }}</el-descriptions-item>
      <el-descriptions-item :min-width="90" label="纳税人识别号">{{ data.supplierTaxId }}</el-descriptions-item>
      <el-descriptions-item :min-width="90" label="收款账号">{{ data.supplierPayeeAccount }}</el-descriptions-item>
      <el-descriptions-item :min-width="90" label="开户行">{{ data.supplierBankName }}</el-descriptions-item>
      <el-descriptions-item :min-width="90" label="备注">{{ data.supplierDescription }}</el-descriptions-item>
      <el-descriptions-item :min-width="90" label="是否启用">
        <el-tag size="small" v-if="data.supplierEnable">启用</el-tag>
        <el-tag size="small" v-else>关闭</el-tag>
      </el-descriptions-item>
    </el-descriptions>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'

import { getSupplier } from '@/api/supplier'
const { proxy } = getCurrentInstance()
const emit = defineEmits()

// 是否显示弹出层
const open = ref(false)
// 表单参数
const data = ref({})

function show(row) {
  if (row) {
    getSupplier(row.supplierId).then((response) => {
      data.value = response.data
    })
  }
  open.value = true
}

// 取消按钮
function cancel() {
  open.value = false
}

/** 提交按钮 */
function submitForm() {}
defineExpose({
  show,
})
</script>

<style>
/* style */
</style>
