<template>
  <div class="omsMessage">
    <div class="omsMessage-header --el-font-size-Base">待办</div>

    <el-scrollbar ref="scrollbarRef" style="height: 100%" @scroll="handleScroll">
      <div class="omsMessage-main" ref="msgRef">
        <el-card
          class="omsMessage-card"
          :body-style="{ padding: '0px !important' }"
          v-for="(item, index) in msgList"
          @click="gotoOrder(item.inquiryId)"
          :key="index"
        >
          <template v-slot:header>
            <div class="clearfix message-card-header">
              <ChatDotSquare style="width: 1em; height: 1em; margin-right: 8px; color: #e6a23c" />
              <Connection
                v-if="item.sysFileInfoList"
                style="width: 1em; height: 1em; margin-right: 8px; color: #67c23a"
              />
              <span>{{ item.chatSenderNickName }}</span>
              <span class="fr">{{ item.chatCreateTime }}</span>
            </div>
          </template>
          <div class="message-card-content">{{ item.content }}</div>
          <div class="clearfix message-card-footer">
            <el-button type="primary" size="small" plain @click="gotoOrder(item.inquiryId)">询报价单</el-button>
            <span style="margin: 0 8px">{{ item.inquirySn }}</span>

            <!-- <span>{{ item.userName }}</span> -->
          </div>
        </el-card>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup name="omsMessage">
import { chatList } from '@/api/purchase/list'
const { proxy } = getCurrentInstance()
const msgList = ref([])
let pageNum = 1
let totalPage = 0

function getChatList(type) {
  chatList({ chatType: 1, pageNum, pageSize: 10 }).then((res) => {
    msgList.value = msgList.value.concat(res.rows)
    totalPage = res.total
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

function gotoOrder(inquiryId) {
  proxy.$router.push({ path: '/inquiry/edit', query: { id: inquiryId } })
}
function handleScroll({ scrollTop }) {
  let warpHeight = proxy.$refs['scrollbarRef'].wrapRef.clientHeight
  let listHeight = proxy.$refs['msgRef'].clientHeight
  if (scrollTop >= listHeight - warpHeight && totalPage > msgList.value.length) {
    pageNum++
    getChatList()
  }
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
  background: #fff;
  .el-card__header {
    border: none;
  }
  .omsMessage-header {
    padding: 10px;
    line-height: 30px;
    box-shadow: 0 4px 4px rgba(0, 21, 41, 0.08);
    border-bottom: 1px solid #efefef;
  }
  .omsMessage-main {
    flex-grow: 1;
    padding: 0 10px 10px 10px;
    font-size: 13px;
    // overflow: scroll;
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
      // border-top: 1px solid var(--el-card-border-color);
    }
  }
}
</style>
