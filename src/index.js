import {webpackSay} from "../library"; //引入 library 的 webpackSay 方法
import Vue from "vue"; //导入vue
import noticeWebpack from "$NOTICE"; //导入noticeWebpack组件

document.write("hello webpack!");
//按需引入demo.js文件
import("./demo").then((result) => {
    result.default();
    webpackSay(); //执行 webpackSay方法
    //告诉 webpack 想要带她去旅游--start---
    function renderNotice(){
        const noticeRootEle = document.createElement("div");
        document.body.append(noticeRootEle);
        new Vue({
            render: (h) => h(noticeWebpack)
        }).$mount(noticeRootEle);
    }
    renderNotice();
    //告诉 webpack 想要带她去旅游--end---
});