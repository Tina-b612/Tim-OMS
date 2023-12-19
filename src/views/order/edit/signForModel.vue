<template>
  <el-dialog title="提示" v-model="open" width="600px" append-to-body>
    <el-form ref="formRef" :model="form" :rules="rules">
      <el-form-item v-if="orderStatus === 6" label="异常签收原因" prop="orderReceiptedException">
        <el-input :rows="3" type="textarea" v-model="form.orderReceiptedException" placeholder="请输入异常签收原因" />
      </el-form-item>
      <el-form-item v-if="orderStatus === 5" label="收货凭证" prop="arrivalFileList">
        <el-upload
          v-model:file-list="form.arrivalFileList"
          :action="base + '/system/info/add'"
          :limit="5"
          :headers="headers"
          accept=".jpg, .jpeg, .png, .doc, .docx, .xls, .xlsx, .pdf"
          :on-success="handleUploadSuccess"
          :on-preview="handleFilePreview"
        >
          <el-button type="primary">上传收货凭证</el-button>
          <!-- <el-icon><Plus /></el-icon> -->
        </el-upload>
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
import { getToken } from '@/utils/auth'
const base = import.meta.env.VITE_APP_BASE_API
const headers = ref({ Authorization: 'Bearer ' + getToken() })

const { proxy } = getCurrentInstance()
const emit = defineEmits()
// 是否显示弹出层
const open = ref(false)
const orderStatus = ref(0)
// 表单参数
const form = ref({
  orderReceiptedException: '',
  arrivalFileList: [],
})
// 表单校验
const rules = {
  orderReceiptedException: [{ required: true, message: '请输入异常签收原因', trigger: 'blur' }],
}

function show(type) {
  console.log(orderStatus)
  orderStatus.value = type
  open.value = true
}

// 表单重置
function reset() {
  form.value = {
    orderReceiptedException: '',
    arrivalFileList: [],
  }
  proxy.resetForm('formRef')
}

// 取消按钮
function cancel() {
  open.value = false
  reset()
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

/** 提交按钮 */
function submitForm() {
  console.log(form.value.arrivalFileList)
  proxy.$refs['formRef'].validate((valid) => {
    if (valid) {
      emit('submit', orderStatus.value, form.value)
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
