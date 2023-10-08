import request from '@/utils/request'

// 查询brand列表
export function listBrand(query) {
  return request({
    url: '/brand/list',
    method: 'get',
    params: query,
  })
}

// 查询brand详细
export function getBrand(brandId) {
  return request({
    url: '/brand/' + brandId,
    method: 'get',
  })
}

// 新增brand
export function addBrand(data) {
  return request({
    url: '/brand',
    method: 'post',
    data: data,
  })
}

// 修改brand
export function updateBrand(data) {
  return request({
    url: '/brand',
    method: 'put',
    data: data,
  })
}

// 删除brand
export function delBrand(brandId) {
  return request({
    url: '/brand/' + brandId,
    method: 'delete',
  })
}

// 批量修改brand
export function listBrandUpdate(data) {
  return request({
    url: '/brand/listBrandUpdate',
    method: 'put',
    data: data,
  })
}
