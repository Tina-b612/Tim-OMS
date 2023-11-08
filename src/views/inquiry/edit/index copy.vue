<template>
  <div>
    <Purchase v-if="proxy.$auth.hasRoleOr(['admin', 'purchase'])" />
    <Sales v-else="proxy.$auth.hasRole(['sales'])" />
  </div>
</template>

<script setup name="Detail">
import Sales from './sales'
import Purchase from './purchase'
// import auth from '@/plugins/auth'
// import useUserStore from '@/store/modules/user'
// const user = useUserStore()
// console.log(user.roles)
const { proxy } = getCurrentInstance()
// console.log(proxy.$auth.hasRole(['sales']))
</script>

<style lang="scss"></style>
