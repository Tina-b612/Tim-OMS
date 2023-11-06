<template>
  <div class="orderMsg">
    <el-container class="orderMsg-container">
      <!-- <el-header>Header</el-header> -->
      <el-main class="orderMsg-main" ref="msgWarpRef">
        <div class="msg-list" ref="msgListRef">
          <div :class="['msg-item', { self: item.userName === userName }]" v-for="item in msgList" :key="item.chatId">
            <div class="sender">
              <img class="avatar" v-if="item.avatar" :src="base + item.avatar" alt="" />
              <el-icon v-else><Service /></el-icon>
              <span>
                {{ item.senderName || 'xxx' }}
              </span>
              <span>{{ item.creatTime }}</span>
            </div>
            <div class="chatAttachmentList fileList" v-if="item.chatAttachmentList">
              <span class="mr10" v-for="file in item.chatAttachmentList">
                <Document style="width: 1em; height: 1em; margin-right: 2px" />
                <el-link
                  type="primary"
                  v-if="file.response"
                  :href="base + (file.response.filePath || file.response.pathName)"
                >
                  {{ file.name }}
                </el-link>
              </span>
            </div>
            <div class="content">
              <pre>{{ item.content }}</pre>
            </div>
          </div>
        </div>
        <div class="fileList" v-if="form.chatAttachmentList" ref="fileListRef">
          <span class="mr20" v-for="item in form.chatAttachmentList">
            <Document style="width: 1em; height: 1em; margin-right: 8px" />
            <el-link
              type="primary"
              v-if="item.response"
              :href="base + (item.response.filePath || item.response.pathName)"
            >
              {{ item.name }}
            </el-link>
          </span>
        </div>
      </el-main>
      <el-footer>
        <el-form ref="formRef" v-model="form">
          <el-form-item props="msg">
            <el-input
              rows="7"
              resize="none"
              type="textarea"
              v-model="form.content"
              placeholder="可通过Enter快速发送消息（可通过Ctrl+Enter换行）"
              @keyup.enter.native="enterSubmit"
            />
          </el-form-item>
          <el-row justify="end" class="mt10">
            <el-upload
              v-model:file-list="form.chatAttachmentList"
              :action="base + '/system/info/add'"
              :limit="3"
              :headers="headers"
              :show-file-list="false"
              accept=".bmp, .gif, .jpg, .jpeg, .png, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .html, .htm, .txt, .rar, .zip, .gz, .bz2, .mp4, .avi, .rmvb, .pdf"
              @success="uploadSuccess"
            >
              <el-button type="primary">上传附件</el-button>
            </el-upload>
            <el-button type="success" class="ml10" @click="submitMsg">发送</el-button>
          </el-row>
        </el-form>
      </el-footer>
    </el-container>
  </div>
</template>

<script setup>
// setup

import { pushChat, chatList } from '@/api/purchase/list'
import { getToken } from '@/utils/auth'
import { nextTick, onMounted, reactive } from 'vue'
import useUserStore from '@/store/modules/user'
const headers = ref({ Authorization: 'Bearer ' + getToken() })
const { proxy } = getCurrentInstance()
const base = import.meta.env.VITE_APP_BASE_API
const userName = useUserStore().name
const avatar = useUserStore().avatar
console.log(userName)
const props = defineProps({
  id: null,
})
const form = ref({})
const msgList = ref([])

function submitMsg() {
  pushChat({ ...form.value, inquiryId: props.id, chatType: 1 }).then((res) => {
    form.value = {
      content: '',
      chatAttachmentList: [],
    }
    getChatList()
  })
}
function enterSubmit(e) {
  if (e.ctrlKey && e.keyCode == 13) {
    //用户点击了ctrl+enter触发
    form.value.content += '\n'
  } else {
    submitMsg()
  }
}
function getChatList() {
  chatList({ inquiryId: props.id, chatType: 1 }).then((res) => {
    msgList.value = res.rows
    console.log(msgList)
    nextTick(() => {
      let boxHeight = proxy.$refs['msgWarpRef'].$el.clientHeight
      let listHeight = proxy.$refs['msgListRef'].clientHeight
      proxy.$refs['msgWarpRef'].$el.scrollTo(0, listHeight - boxHeight)
    })
  })
}
function uploadSuccess() {
  nextTick(() => {
    let boxHeight = proxy.$refs['msgWarpRef'].$el.clientHeight
    let listHeight = proxy.$refs['msgListRef'].clientHeight
    let fileHieght = proxy.$refs['fileListRef'].clientHeight
    proxy.$refs['msgWarpRef'].$el.scrollTo(0, listHeight - boxHeight + fileHieght)
  })
}
// getChatList()
onMounted(() => {
  getChatList()
})
</script>

<style lang="scss">
/* style */
.orderMsg {
  height: calc(100vh - 90px);
  .orderMsg-main {
    // position: relative;
    padding: 0;
    display: flex;
    flex-direction: column;
    .msg-list {
      flex-grow: 1;
      padding: 20px 15px;
      .msg-item {
        margin-top: 10px;
        &.self {
          text-align: right;
          .sender {
            flex-direction: row-reverse;
          }
          .content {
            flex-direction: row-reverse;
          }
        }
        .sender {
          display: flex;
          align-items: center;
          font-size: 13px;
          line-height: 20px;
          span {
            margin: 0 5px;
          }
          .avatar {
            width: 20px;
            height: 20px;
          }
        }

        .chatAttachmentList {
          border: none;
          line-height: 12px;
          span {
            font-size: 12px;
            line-height: 12px;
          }
        }
        .content {
          margin-top: 5px;
          font-size: 13px;
          line-height: 20px;
          padding: 0 10px;
          display: flex;
          // flex-direction: column;
          // align-items: flex-start;
          pre {
            margin: 0;
            padding: 10px;
            white-space: pre-wrap;
            line-height: 1.5em;
            background: var(--el-color-success-light-5);
            border-radius: 4px;
          }
        }
      }
    }
    .fileList {
      line-height: 32px;
      width: 100%;
      // height: 50px;
      border-top: 1px solid var(--el-border-color);
      // position: absolute;
      // bottom: 0;
      flex: 0 0 auto;
      padding: 0 20px;
      color: var(--el-color-primary);
      span {
        display: inline-flex;
        vertical-align: top;
        justify-content: center;
        align-items: center;
      }
    }
  }
  .orderMsg-container {
    height: 100%;
    .el-footer {
      height: 235px;
      border-top: 1px solid var(--el-border-color);
      padding-top: 20px;
    }
  }
}
</style>
