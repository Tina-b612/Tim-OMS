<template>
  <el-dialog :title="transferProps.title" v-model="open" width="700px" v-if="open" append-to-body>
    <el-transfer
      ref="transferRef"
      class="flex-center"
      v-model="selection"
      :props="transferProps.props"
      filterable
      :filter-placeholder="transferProps.filterPlaceholder"
      :titles="transferProps.titles"
      :data="transferProps.data"
    >
      <template #default="{ option }">
        <span>{{ option[transferProps.props.label] }}</span>
      </template>
    </el-transfer>
    <div slot="footer" class="dialog-footer flex-center mt20">
      <el-button type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { updateBrandSupplier, updateBrandUser } from '@/api/brand'

const { proxy } = getCurrentInstance()
const emit = defineEmits()
const props = defineProps({
  transferProps: Object,
})

// 是否显示弹出层
const open = ref(false)
const data = ref([])
const brandId = ref(null)
const editType = ref(null)
// 表单参数
const selection = ref([])

function show(row, type) {
  selection.value = []
  if (row) {
    // data.value = props.userList.filter((user) => {
    //   return row.brandResponsibleUserList.every((sUser) => {
    //     {
    //       return user.userId != sUser.userId
    //     }
    //   })
    // })
    brandId.value = row.brandId
    editType.value = type
    let key = type === 1 ? 'brandResponsibleUserList' : 'brandSupplierList'
    selection.value = row[key].map((item) => {
      {
        return item.userId || item.supplierId
      }
    })
    console.log(selection.value)
  }
  open.value = true
}

// 取消按钮
function cancel() {
  open.value = false
}

/** 提交按钮 */
function submitForm() {
  console.log(selection.value)
  // return
  if (editType.value === 1) {
    updateBrandUser({
      brandId: brandId.value,
      bindUserIdList: selection.value,
    }).then((response) => {
      proxy.$modal.msgSuccess('修改成功')
      open.value = false
      emit('submit')
    })
  }
  if (editType.value === 2) {
    updateBrandSupplier({
      brandId: brandId.value,
      bindSupplierIdList: selection.value,
    }).then((response) => {
      proxy.$modal.msgSuccess('修改成功')
      open.value = false
      emit('submit')
    })
  }
}
defineExpose({
  show,
})
</script>

<style>
/* style */
</style>
