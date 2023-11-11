import request from '@/utils/request'

// 查询询盘列表
export function listOrder(query) {
  return request({
    url: '/order/list',
    method: 'get',
    params: query,
  })
}

// 查询询盘详细
export function getOrder(inquiryId) {
  return request({
    url: '/order/' + inquiryId,
    method: 'get',
  })
}

// 新增询盘
export function addOrder(data) {
  return request({
    url: '/order',
    method: 'post',
    data: data,
  })
}

// 修改询盘
export function updateOrder(data) {
  return request({
    url: '/order',
    method: 'put',
    data: data,
  })
}

// 删除询盘
export function delOrder(inquiryId) {
  return request({
    url: '/order/' + inquiryId,
    method: 'delete',
  })
}
// 获取分类询盘数量
export function getOrderCount(query) {
  return request({
    url: '/order/count',
    method: 'get',
    params: query,
  })
}

// 修改询盘
export function editOrderStatus(data) {
  return request({
    url: '/order/editOrderStatus',
    method: 'put',
    data: data,
  })
}

// 确认付款
export function payment(data) {
  return request({
    url: '/payment',
    method: 'put',
    data: data,
  })
}
