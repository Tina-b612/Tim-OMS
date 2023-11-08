import request from '@/utils/request'
// 删除菜单
export function delFile(fileId) {
  return request({
    url: '/system/info/' + fileId,
    method: 'delete',
  })
}
