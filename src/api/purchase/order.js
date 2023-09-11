import request from '@/utils/request'

// 查询订单管理列表
export function listOrder(query) {
  return request({
    url: '/purchase/order/list',
    method: 'get',
    params: query,
  })
}

// 查询订单管理详细
export function getOrder(purchaseId) {
  return request({
    url: '/purchase/order/' + purchaseId,
    method: 'get',
  })
}

// 新增订单管理
export function addOrder(data) {
  return request({
    url: '/purchase/order',
    method: 'post',
    data: data,
  })
}

// 修改订单管理
export function updateOrder(data) {
  return request({
    url: '/purchase/order',
    method: 'put',
    data: data,
  })
}

// 删除订单管理
export function delOrder(purchaseId) {
  return request({
    url: '/purchase/order/' + purchaseId,
    method: 'delete',
  })
}

// 查询采购员、管理员
export function SearchUser(query) {
  return request({
    url: '/system/user/listForUser',
    method: 'get',
    params: query,
  })
}

// 查询品牌
export function searchBrand(query) {
  return request({
    url: '/purchase/brand/listForUser',
    method: 'get',
    params: query,
  })
}

// 查询型号
export function searchModel(query) {
  return request({
    url: '/purchase/model/listForUser',
    method: 'get',
    params: query,
  })
}
