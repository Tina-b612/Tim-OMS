<template>
  <el-select
    v-model="selection"
    filterable
    default-first-option
    clearable
    remote
    :placeholder="placeholder"
    remote-show-suffix
    :remote-method="handleSearch"
    @change="selectChange"
    :loading="selectLoading"
  >
    <el-option
      style="width: 280px"
      v-for="item in searchList"
      :label="item[[props.searchKey]]"
      :value="item[searchValue]"
    >
      <span style="width: 100px">{{ item[[props.searchKey]] }}</span>
    </el-option>
  </el-select>
</template>

<script setup>
import { watch } from 'vue'

const emit = defineEmits()
const props = defineProps({
  modelValue: [Number, Object],
  remoteFunction: Function,
  searchKey: String,
  searchValue: String,
  placeholder: String,
  defaultList: Array,
  supplierEnable: Number,
  brandId: Number,
})
const selectLoading = ref(false)
const searchList = ref([])
const selection = ref(null)

onMounted(() => {
  if (props.modelValue) {
    searchList.value = props.defaultList
    selection.value = props.modelValue
  }
})

function handleSearch(seachValue) {
  if (seachValue) {
    selectLoading.value = true
    let request = { [props.searchKey]: seachValue }
    if (props.supplierEnable) {
      request.supplierEnable = props.supplierEnable
    }
    if (props.brandId) {
      request.brandId = props.brandId
    }
    props.remoteFunction(request).then((response) => {
      selectLoading.value = false
      searchList.value = response
    })
  }
}
// 选择品牌
function selectChange(value) {
  emit('update:modelValue', value)
}
</script>

<style>
/* style */
</style>
