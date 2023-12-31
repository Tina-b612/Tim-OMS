import request from '@/utils/request'

// 查询供应商管理列表
export function listSupplier(query) {
  return request({
    url: '/supplier/list',
    method: 'get',
    params: query,
  })
}

// 查询供应商管理详细
export function getSupplier(supplierId) {
  return request({
    url: '/supplier/' + supplierId,
    method: 'get',
  })
}

// 新增供应商管理
export function addSupplier(data) {
  return request({
    url: '/supplier',
    method: 'post',
    data: data,
  })
}

// 修改供应商管理
export function updateSupplier(data) {
  return request({
    url: '/supplier',
    method: 'put',
    data: data,
  })
}

// 删除供应商管理
export function delSupplier(supplierId) {
  return request({
    url: '/supplier/' + supplierId,
    method: 'delete',
  })
}
// 查询品牌关联的供应商
export function listBrandRelatedSupplier(query) {
  return request({
    url: '/supplier/listBrandRelatedSupplier',
    method: 'get',
    params: query,
  })
}
