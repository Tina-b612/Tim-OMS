import request from '@/utils/request'

// 查询订单管理列表
export function listOrder(query) {
  return request({
    url: '/purchase/list',
    method: 'get',
    params: query,
  })
}

// 查询订单管理详细
export function getOrder(purchaseId) {
  return request({
    url: '/purchase/' + purchaseId,
    method: 'get',
  })
}

// 新增订单管理
export function addOrder(data) {
  return request({
    url: '/purchase',
    method: 'post',
    data: data,
  })
}

// 修改订单管理
export function updateOrder(data) {
  return request({
    url: '/purchase',
    method: 'put',
    data: data,
  })
}

// 删除订单管理
export function delOrder(purchaseId) {
  return request({
    url: '/purchase/' + purchaseId,
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
    url: '/brand/listForAll',
    method: 'get',
    params: query,
  })
}

// 查询型号
export function searchModel(query) {
  return request({
    url: '/model/listForUser',
    method: 'get',
    params: query,
  })
}
// 查询供应商  /supplier/listForUser

export function searchSupplier(query) {
  return request({
    url: '/supplier/listForUser',
    method: 'get',
    params: query,
  })
}

// 获取分类订单数量
export function getPurchaseCount(query) {
  return request({
    url: '/purchase/count',
    method: 'get',
    params: query,
  })
}

// 发送消息
export function pushChat(data) {
  return request({
    url: '/chat',
    method: 'post',
    data: data,
  })
}

// 获取消息
export function chatList(query) {
  return request({
    url: '/chat/list',
    method: 'get',
    params: query,
  })
}
