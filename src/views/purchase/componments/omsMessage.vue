<template>
  <div class="omsMessage">
    <div class="omsMessage-header --el-font-size-Base">待办</div>
    <div class="omsMessage-main">
      <el-card class="omsMessage-card" :body-style="{ padding: '0px !important' }" v-for="i in 5">
        <template v-slot:header>
          <div class="clearfix message-card-header">
            <ChatDotSquare style="width: 1em; height: 1em; margin-right: 8px; color: #e6a23c" />
            <Connection style="width: 1em; height: 1em; margin-right: 8px; color: #67c23a" />
            <span>销售员</span>
            <span class="fr">09-12 08:22</span>
          </div>
        </template>
        <div class="message-card-content">您好！供应商通过您提供的资料而提供的产品报价，请查看是否您需要的产品。</div>
        <div class="clearfix message-card-footer">
          <el-button type="primary" size="small" plain>询报价单</el-button>
          <span style="margin: 0 8px">213141434</span>
          ,
          <span>林光裕</span>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup name="omsMessage">
// setup
const message = '123消息'
</script>

<style lang="scss">
/* style */
.omsMessage {
  overflow: scroll;
  // padding: 20px;
  .omsMessage-header {
    padding: 10px;
    line-height: 40px;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  }
  .omsMessage-main {
    padding: 0 10px 10px 10px;
    font-size: 13px;
    .omsMessage-card {
      margin-top: 10px;
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
