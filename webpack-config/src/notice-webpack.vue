<template>
    <div class="notice-webpack">
        <div>通知webpack...</div>
        <div>通知webpack测试中...</div>
        <div class="msg">{{msg}}</div>
    </div>
</template>
<script>
export default {
    name: "notice-webpack",
    data(){
        return {
            msg: "收到通知"
        }
    }
}
</script>
<style lang="scss">
.notice-webpack{
    .msg {
        color: #19cfe1;
    }
}
</style>
