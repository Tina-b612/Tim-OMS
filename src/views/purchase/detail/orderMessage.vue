<template>
  <div class="orderMsg">
    <el-container class="orderMsg-container">
      <el-header>Header</el-header>
      <el-main>Main</el-main>
      <el-footer>
        <el-form>
          <el-input rows="7" type="textarea" v-model="msg" placeholder="请输入产品描述" />
          <el-row justify="end" class="mt10">
            <el-upload
              v-model:file-list="attachmentList"
              action="/dev-api/system/info/add"
              :limit="3"
              :headers="headers"
              :show-file-list="false"
              accept=".bmp, .gif, .jpg, .jpeg, .png, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .html, .htm, .txt, .rar, .zip, .gz, .bz2, .mp4, .avi, .rmvb, .pdf"
            >
              <el-button type="primary">上传附件</el-button>
            </el-upload>
            <el-button type="success" class="ml10">发送</el-button>
          </el-row>
        </el-form>
      </el-footer>
    </el-container>
    <!-- <div class="orderMsg-content">消息列表</div>
    <div class="orderMsg-input">
      <el-input rows="5" type="textarea" v-model="msg" placeholder="请输入产品描述" />
    </div> -->
  </div>
</template>

<script setup>
// setup

import { getToken } from '@/utils/auth'
const headers = ref({ Authorization: 'Bearer ' + getToken() })
const msg = ref('')
const attachmentList = ref([])
</script>

<style lang="scss">
/* style */
.orderMsg {
  height: calc(100vh - 90px);
  .orderMsg-container {
    height: 100%;
    .el-footer {
      height: 230px;
      border-top: 1px solid var(--el-border-color);
      padding-top: 20px;
    }
  }
}
</style>
