<template>
  <el-dialog :title="title" v-model="open" width="500px" append-to-body>
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100">
      <el-form-item label="供应商名称" prop="supplierName">
        <el-input v-model="form.supplierName" placeholder="请输入供应商名称" />
      </el-form-item>
      <el-form-item label="联系人" prop="supplierContactName">
        <el-input v-model="form.supplierContactName" placeholder="请输入联系人" />
      </el-form-item>
      <el-form-item label="联系电话" prop="supplierContactPhone">
        <el-input v-model="form.supplierContactPhone" placeholder="请输入联系电话" />
      </el-form-item>
      <el-form-item label="email" prop="supplierEmail">
        <el-input v-model="form.supplierEmail" placeholder="请输入email" />
      </el-form-item>
      <el-form-item label="地址" prop="supplierAddress">
        <el-input v-model="form.supplierAddress" placeholder="请输入地址" />
      </el-form-item>
      <el-form-item label="网址" prop="supplierWeb">
        <el-input v-model="form.supplierWeb" placeholder="请输入网址" />
      </el-form-item>
      <el-form-item label="微信" prop="supplierWechat">
        <el-input v-model="form.supplierWechat" placeholder="请输入微信" />
      </el-form-item>
      <el-form-item label="支付宝" prop="supplierZhifubao">
        <el-input v-model="form.supplierZhifubao" placeholder="请输入支付宝" />
      </el-form-item>
      <el-form-item label="纳税人识别号" prop="supplierTaxId">
        <el-input v-model="form.supplierTaxId" placeholder="请输入纳税人识别号" />
      </el-form-item>
      <el-form-item label="收款账号" prop="supplierPayeeAccount">
        <el-input v-model="form.supplierPayeeAccount" placeholder="请输入收款账号" />
      </el-form-item>
      <el-form-item label="开户行" prop="supplierBankName">
        <el-input v-model="form.supplierBankName" placeholder="请输入开户行" />
      </el-form-item>
      <el-form-item label="备注" prop="supplierDescription">
        <el-input v-model="form.supplierDescription" placeholder="请输入备注" />
      </el-form-item>
      <el-form-item label="是否启用" prop="supplierEnable">
        <el-switch v-model="form.supplierEnable" :active-value="1" :inactive-value="0" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer flex-center">
      <el-button type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { addSupplier, updateSupplier } from '@/api/supplier'

const { proxy } = getCurrentInstance()
const emit = defineEmits()
const props = defineProps({
  title: String,
})

// 是否显示弹出层
const open = ref(false)
// 表单参数
const form = ref({
  supplierEnable: 1,
})
// 表单校验
const rules = {
  supplierName: [{ required: true, message: '供应商名称不能为空', trigger: 'blur' }],
}

function show(row) {
  if (row) {
    console.log(row)
    form.value = row
  }
  open.value = true
}

// 表单重置
function reset() {
  form.value = {
    brandEnable: 1,
  }
  proxy.resetForm('formRef')
}

// 取消按钮
function cancel() {
  open.value = false
  reset()
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs['formRef'].validate((valid) => {
    if (valid) {
      if (form.value.supplierId != null) {
        updateSupplier(form.value).then((response) => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          emit('submit')
        })
      } else {
        addSupplier(form.value).then((response) => {
          proxy.$modal.msgSuccess('新增成功')
          open.value = false
          emit('submit')
        })
      }
    }
  })
}
defineExpose({
  show,
})
</script>

<style>
/* style */
</style>
