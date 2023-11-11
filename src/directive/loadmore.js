const loadMore = {
  beforeMount(el, binding) {
    const selectDom = document.querySelector('.more_select_dropdown .el-select-dropdown .el-select-dropdown__wrap')
    function loadMores(domdom) {
      const isBase = domdom.scrollHeight - domdom.scrollTop <= domdom.clientHeight
      if (isBase) {
        binding.value && binding.value()
      }
    }
    el.selectDomInfo = selectDom
    el.userLoadMore = loadMores
    nextTick(() => {
      selectDom.addEventListener('scroll', loadMores)
    })
  },
  beforeUnmount(el) {
    if (el.userLoadMore) {
      el.selectDomInfo.removeEventListener('scroll', el.userLoadMore)
      delete el.selectDomInfo
      delete el.userLoadMore
    }
  },
}
export default loadMore
