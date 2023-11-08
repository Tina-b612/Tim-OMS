import request from '@/utils/request'

// 查询询盘列表
export function listInquiry(query) {
  return request({
    url: '/inquiry/list',
    method: 'get',
    params: query,
  })
}

// 查询询盘详细
export function getInquiry(inquiryId) {
  return request({
    url: '/inquiry/' + inquiryId,
    method: 'get',
  })
}

// 新增询盘
export function addInquiry(data) {
  return request({
    url: '/inquiry',
    method: 'post',
    data: data,
  })
}

// 修改询盘
export function updateInquiry(data) {
  return request({
    url: '/inquiry',
    method: 'put',
    data: data,
  })
}

// 删除询盘
export function delInquiry(inquiryId) {
  return request({
    url: '/inquiry/' + inquiryId,
    method: 'delete',
  })
}
// 获取分类询盘数量
export function getInquiryCount(query) {
  return request({
    url: '/inquiry/count',
    method: 'get',
    params: query,
  })
}

// 修改询盘
export function editInquiryStatus(data) {
  return request({
    url: '/inquiry/editInquiryStatus',
    method: 'put',
    data: data,
  })
}
