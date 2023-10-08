<template>
  <div class="omsMessage">
    <div class="omsMessage-header --el-font-size-Base">待办</div>
    <div class="omsMessage-main" ref="msgRef">
      <el-card
        class="omsMessage-card"
        :body-style="{ padding: '0px !important' }"
        v-for="(item, index) in msgList"
        @click="gotoOrder(item.purchaseId)"
        :key="index"
      >
        <template v-slot:header>
          <div class="clearfix message-card-header">
            <ChatDotSquare style="width: 1em; height: 1em; margin-right: 8px; color: #e6a23c" />
            <Connection
              v-if="item.chatAttachmentList"
              style="width: 1em; height: 1em; margin-right: 8px; color: #67c23a"
            />
            <span>{{ item.senderName }}</span>
            <span class="fr">{{ item.creatTime }}</span>
          </div>
        </template>
        <div class="message-card-content">{{ item.content }}</div>
        <div class="clearfix message-card-footer">
          <el-button type="primary" size="small" plain @click="gotoOrder(item.purchaseId)">询报价单</el-button>
          <span style="margin: 0 8px">{{ item.purchaseSn }}</span>

          <!-- <span>{{ item.userName }}</span> -->
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup name="omsMessage">
import { chatList } from '@/api/purchase/list'
const { proxy } = getCurrentInstance()
const msgList = ref([])

function getChatList() {
  chatList().then((res) => {
    msgList.value = res || []
  })
}
getChatList()
// const timeout = setInterval(() => {
//   chatList()
//     .then((res) => {
//       msgList.value = res || []
//       proxy.$refs['msgRef'].$el.scrollTo(0, listHeight - boxHeight)
//     })
//     .catch(() => {
//       clearInterval(timeout)
//     })
// }, 1000)

function gotoOrder(purchaseId) {
  proxy.$router.push({ name: 'Purchase/detail', query: { id: purchaseId } })
}
</script>

<style lang="scss">
/* style */
.message-containar {
  height: calc(100vh - 90px);
  // overflow: scroll;
}
.omsMessage {
  // overflow: scroll;
  // padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  .omsMessage-header {
    padding: 10px;
    line-height: 40px;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  }
  .omsMessage-main {
    flex-grow: 1;
    padding: 0 10px 10px 10px;
    font-size: 13px;
    overflow: scroll;
    .omsMessage-card {
      margin-top: 10px;
      &:hover {
        background: #f1f1f1;
      }
    }
    .message-card-header {
      font-size: 13px;
    }
    .message-card-content {
      padding: 10px;
      line-height: 20px;
    }
    .message-card-footer {
      // margin-top: 10px;
      padding: 10px;
      border-top: 1px solid var(--el-card-border-color);
    }
  }
}
</style>
