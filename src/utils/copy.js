import { ElMessage } from 'element-plus'
export function copyText(text) {
  let oInput
  if (document.getElementById('copyInput')) {
    oInput = document.getElementById('copyInput')
  } else {
    oInput = document.createElement('textarea')
    // oInput.setAttribute('type','')
  }
  oInput.value = text
  oInput.id = 'copyInput'
  oInput.className = 'copy-input'
  document.body.appendChild(oInput)
  oInput.select() // 选择对象;
  document.execCommand('Copy') // 执行浏览器复制命令
  ElMessage.success('复制成功！')
}
