<template>
  <!-- v-loadmore="loadmore"
    class="more-select"
    popper-class="more_select_dropdown" -->
  <el-select
    v-model="selection"
    value-key="supplierName"
    filterable
    default-first-option
    clearable
    remote
    allow-create
    placeholder="请输入供应商"
    remote-show-suffix
    :remote-method="handleSearch"
    @change="selectChange"
    :loading="selectLoading"
    :disabled="disabled"
  >
    <el-option
      class="flex-center-between"
      style="width: 280px"
      v-for="item in searchList"
      :key="item.supplierId"
      :label="item.supplierName"
      :value="item"
    >
      <!-- <img :src="item.brandLogo || defaultLogo" style="width: 22px; height: 22px" />
      <span style="width: 100px">{{ item.supplierName }}</span>
      <span style="width: 50px; color: var(--el-text-color-secondary); font-size: 12px; margin-left: 4px">
        {{ item.country || '未知国家' }}
      </span> -->
    </el-option>
  </el-select>
</template>

<script setup>
// setup
import { searchSupplier } from '@/api/brand'
import { watch } from 'vue'
const emit = defineEmits()
const props = defineProps({
  modelValue: [String, Object],
  extroProps: Object,
  disabled: Boolean,
})
const selectLoading = ref(false)
const searchList = ref([])
const selection = ref(null)

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      selection.value = val
      if (searchList.value.length === 0) {
        searchList.value = [val]
      }
    }
  },
  { deep: true, immediate: true }
)

// brandList 搜索品牌
function handleSearch(supplierName) {
  if (supplierName) {
    selectLoading.value = true
    searchSupplier({ supplierName: supplierName, ...props.extroProps }).then((response) => {
      selectLoading.value = false
      searchList.value = response
    })
  }
}
// 选择品牌
function selectChange(value) {
  if (typeof value === 'string') {
    let obj = {
      supplierId: '',
      supplierName: value,
    }
    emit('update:modelValue', obj)
    emit('change', obj)
  } else {
    // let obj = {
    //   supplierId: value.supplierId,
    //   supplierName: value.supplierName,
    // }
    // console.log(obj)
    emit('update:modelValue', value)
  }
}
const pageNo = ref(0)
const hasNest = ref(true)
function loadmore() {
  setTimeout(() => {
    if (hasNest.value === false) {
      return
    } else {
      pageNo.value = pageNo.value + 1
      console.log('加载')
    }
  })
}
</script>

<style>
/* style */
</style>
