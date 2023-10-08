<template>
  <el-select
    v-model="selection"
    value-key="brandName"
    allow-create
    filterable
    default-first-option
    clearable
    remote
    placeholder="请输入品牌名称"
    remote-show-suffix
    :remote-method="handleSearchBrandList"
    @change="brandSelectChange"
    :loading="selectLoading"
    :disabled="orderState == 5 || orderState == 7"
  >
    <el-option v-for="item in brandSearchList" :key="item.brandId" :label="item.brandName" :value="item" />
  </el-select>
</template>

<script setup>
// setup
import { searchBrand } from '@/api/purchase/list'
const props = defineProps({
  modelValue: [String, Object],
})
const selection = ref(null)
// brandList 搜索品牌
const selectLoading = ref(false)
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
// 选择品牌
function brandSelectChange(value) {
  if (typeof value === 'string') {
    let obj = {
      brandId: '',
      brandName: value,
    }
    emit('update:modelValue', obj)
  } else {
    emit('update:modelValue', value)
  }
}
</script>

<style>
/* style */
</style>
