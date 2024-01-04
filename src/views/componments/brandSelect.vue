<template>
  <!-- v-loadmore="loadmore"
    class="more-select"
    popper-class="more_select_dropdown" -->
  <el-select
    v-model="selection"
    value-key="brandName"
    filterable
    default-first-option
    clearable
    remote
    allow-create
    placeholder="请输入品牌名称"
    remote-show-suffix
    :remote-method="handleSearchBrandList"
    @change="brandSelectChange"
    :loading="selectLoading"
    :disabled="disabled"
  >
    <el-option
      class="flex-center-between"
      style="width: 280px"
      v-for="item in brandSearchList"
      :key="item.brandId"
      :label="item.brandName"
      :value="item"
    >
      <img :src="item.brandLogo || defaultLogo" style="width: 22px; height: 22px" />
      <span style="width: 100px">{{ item.brandName }}</span>
      <span style="width: 50px; color: var(--el-text-color-secondary); font-size: 12px; margin-left: 4px">
        {{ item.brandCountry || '未知国家' }}
      </span>
    </el-option>
  </el-select>
</template>

<script setup>
// setup
import { searchBrand } from '@/api/brand'
import { watch } from 'vue'
import defaultLogo from '@/assets/images/default.png'
const emit = defineEmits()
const props = defineProps({
  modelValue: [String, Object],
  extroProps: Object,
  disabled: Boolean,
})
const selectLoading = ref(false)
const brandSearchList = ref([])
const selection = ref(null)

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      selection.value = val
      if (brandSearchList.value.length === 0) {
        brandSearchList.value = [val]
      }
    }
  },
  { deep: true, immediate: true }
)

// brandList 搜索品牌
function handleSearchBrandList(brandName) {
  if (brandName) {
    selectLoading.value = true
    searchBrand({ brandName: brandName, ...props.extroProps }).then((response) => {
      selectLoading.value = false
      brandSearchList.value = response
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
    emit('change', obj)
  } else {
    // let obj = {
    //   brandId: value.brandId,
    //   brandName: value.brandName,
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
