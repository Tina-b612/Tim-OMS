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
      <img :src="item.logo || defaultLogo" style="width: 22px; height: 22px" />
      <span style="width: 100px">{{ item.brandName }}</span>
      <span style="width: 50px; color: var(--el-text-color-secondary); font-size: 12px; margin-left: 4px">
        {{ item.country || '未知国家' }}
      </span>
    </el-option>
  </el-select>
</template>

<script setup>
// setup
import { searchBrand } from '@/api/brand'
import { watch } from 'vue'
import { onBeforeMount, onMounted, reactive } from 'vue'
import { deepClone } from '@/utils/index'
import defaultLogo from '@/assets/images/default.png'
const emit = defineEmits()
const props = defineProps({
  modelValue: [String, Object],
  orderState: {
    type: [String, Number],
    default: 1,
  },
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
    searchBrand({ brandName: brandName }).then((response) => {
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
  } else {
    // let obj = {
    //   brandId: value.brandId,
    //   brandName: value.brandName,
    // }
    // console.log(obj)
    emit('update:modelValue', value)
  }
}
</script>

<style>
/* style */
</style>
