<template>
  <div class="notice">
    <div>通知webpack</div>
    <div>通知测试中。。。。。。。</div>
    <div class="boy">{{ msg }}</div>
  </div>
</template>
<script>
export default {
  name: 'notice',
  data() {
    return {
      msg: '收到通知！',
    };
  },
};
</script>
<style lang="scss">
.notice {
  .boy {
    color: #19cfe1;
  }
}
</style>