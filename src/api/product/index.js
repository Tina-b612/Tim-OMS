import request from '@/utils/request'

// 修改产品
export function updateProduct(data) {
  return request({
    url: '/product',
    method: 'put',
    data: data,
  })
}
// 删除产品
export function delProduct(inquiryId) {
  return request({
    url: '/product/' + inquiryId,
    method: 'delete',
  })
}
