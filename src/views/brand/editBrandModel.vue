<template>
  <el-dialog :title="title" v-model="open" width="500px" append-to-body>
    <el-form ref="formRef" :model="form" :rules="rules" label-width="90">
      <el-form-item label="品牌名称" prop="brandName">
        <el-input v-model="form.brandName" placeholder="请输入品牌名称" />
      </el-form-item>
      <el-form-item label="品牌logo" prop="brandLogo">
        <image-upload v-model="form.brandLogo" :limit="1" />
      </el-form-item>
      <el-form-item label="国家" prop="brandCountry">
        <el-input v-model="form.brandCountry" placeholder="请输入国家" />
      </el-form-item>
      <el-form-item label="是否启用" prop="brandEnable">
        <el-switch v-model="form.brandEnable" :active-value="1" :inactive-value="0" />
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
const props = defineProps({
  title: String,
})

// 是否显示弹出层
const open = ref(false)
// const brandLogo = ref(null)
// 表单参数
const form = ref({
  brandEnable: 1,
})
// 表单校验
const rules = {
  brandName: [{ required: true, message: '品牌名称不能为空', trigger: 'blur' }],
}

function show(row) {
  if (row) {
    console.log(row)
    form.value = {
      brandId: row.brandId,
      brandName: row.brandName,
      brandLogo: row.brandLogo,
      brandCountry: row.brandCountry,
      brandEnable: row.brandEnable,
    }
  }
  open.value = true
}

// 表单重置
function reset() {
  form.value = {
    brandName: null,
    brandLogo: null,
    brandCountry: null,
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
      // form.value.brandLogo = brandLogo.value
      if (form.value.brandId != null) {
        updateBrand(form.value).then((response) => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          emit('submit')
        })
      } else {
        addBrand(form.value).then((response) => {
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
