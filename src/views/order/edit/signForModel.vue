<template>
  <el-dialog title="提示" v-model="open" width="600px" append-to-body>
    <el-form ref="formRef" :model="form" :rules="rules">
      <el-form-item label="异常签收原因" prop="orderReceiptedException">
        <el-input :rows="3" type="textarea" v-model="form.orderReceiptedException" placeholder="请输入异常签收原因" />
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
import { addBrand, updateBrand } from '@/api/brand'

const { proxy } = getCurrentInstance()
const emit = defineEmits()
// 是否显示弹出层
const open = ref(false)
// 表单参数
const form = ref({
  orderReceiptedException: '',
})
// 表单校验
const rules = {
  orderReceiptedException: [{ required: true, message: '请输入异常签收原因', trigger: 'blur' }],
}

function show() {
  open.value = true
}

// 表单重置
function reset() {
  form.value = {
    orderReceiptedException: '',
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
      emit('submit', 6, form.value)
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
