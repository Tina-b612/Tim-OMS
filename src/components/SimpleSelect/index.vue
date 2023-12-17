<template>
  <el-select
    v-model="selection"
    :value-key="props.searchKey"
    filterable
    default-first-option
    clearable
    remote
    allow-create
    :placeholder="placeholder"
    remote-show-suffix
    :remote-method="handleSearch"
    @change="selectChange"
    :loading="selectLoading"
  >
    <el-option
      style="width: 280px"
      v-for="item in searchList"
      :key="item[props.searchValue]"
      :label="item[props.searchKey]"
      :value="item"
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
  defaultList: {
    type: Array,
    default: () => [],
  },
  supplierEnable: Number,
  brandId: Number,
})
const selectLoading = ref(false)
const searchList = ref([])
const selection = ref(null)

onMounted(() => {
  if (props.modelValue) {
    console.log('回显值:')
    console.log(props.modelValue)

    console.log('默认列表:')
    console.log(props.defaultList)
    selection.value = props.modelValue
  }
})

watch(
  () => props.defaultList,
  () => {
    searchList.value = props.defaultList
    console.log('默认列表:')
    console.log(props.defaultList)
  }
)

watch(
  () => props.modelValue,
  () => {
    selection.value = props.modelValue
    console.log('回显值:')
    console.log(props.defaultList)
  }
)

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
  let obj = {}
  if (typeof value === 'string') {
    obj = {
      [props.searchValue]: '',
      [props.searchKey]: value,
    }
  } else {
    obj = value
  }
  emit('update:modelValue', obj)
  // emit('update:modelValue', value)
}
</script>

<style>
/* style */
</style>
