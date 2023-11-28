<template>
  <el-select
    v-model="selection"
    filterable
    default-first-option
    clearable
    allow-create
    :placeholder="placeholder"
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
import { onMounted, watch } from 'vue'

const emit = defineEmits()
const props = defineProps({
  modelValue: [Number, Object, String],
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
  selection.value = props.modelValue
  searchList.value = props.defaultList
  // console.log('我拿到供应商了')
  // console.log(props.defaultList)
})

watch(
  () => props.defaultList,
  () => {
    searchList.value = props.defaultList
    // console.log('我监控供应商了')
    // console.log(props.defaultList)
  }
)
watch(
  () => props.modelValue,
  () => {
    selection.value = props.modelValue
  }
)

// 选择品牌
function selectChange(value) {
  let obj = {}
  if (typeof value === 'string') {
    obj = {
      brandId: '',
      brandName: value,
    }
  } else {
    obj = value
  }
  emit('update:modelValue', obj)
}
</script>

<style>
/* style */
</style>
