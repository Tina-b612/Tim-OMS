<template>
  <el-select v-model="selection" filterable default-first-option clearable remote :placeholder="placeholder"
    remote-show-suffix :remote-method="handleSearch" @change="selectChange" :loading="selectLoading">
    <el-option style="width: 280px" v-for="item in searchList" :key="item[props.searchValue]"
      :label="item[props.searchKey]" :value="item[props.searchValue]">
      <span style="width: 100px">{{ item[[props.searchKey]] }}</span>
    </el-option>
  </el-select>
</template>

<script setup>
import { watch } from 'vue'
const emit = defineEmits()
const props = defineProps({
  modelValue: [String, Number],
  extroProps: Object,
  remoteFunction: Function,
  searchKey: String,
  searchValue: String,
  placeholder: String,
  defaultList: {
    type: Array,
    default: () => [],
  },
})
const selectLoading = ref(false)
const searchList = ref([])
const selection = ref(null)

watch(
  () => props.modelValue,
  (val) => {
    selection.value = val
  },
  { deep: true, immediate: true }
)

function handleSearch(seachValue) {
  if (seachValue) {
    selectLoading.value = true
    let request = { [props.searchKey]: seachValue, ...props.extroProps }
    props.remoteFunction(request).then((response) => {
      selectLoading.value = false
      searchList.value = response
    })
  }
}
// 选择
function selectChange(value) {
  emit('update:modelValue', value)
}
</script>

<style>
/* style */
</style>
