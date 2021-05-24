import {webpackSay} from "../library"; //引入 library 的 webpackSay 方法
import Vue from "vue"; //导入vue
import noticeWebpack from "$NOTICE"; //导入noticeWebpack组件

document.write('hello webpack!');

// 按需引入 demo.js 文件
import('./demo').then((result) => {
    result.default(); // 满足 demo 的需求
    webpackSay();

    //notice webpack
    function renderNotice(){
        const noticeRootEle = document.createElement('div');
        document.body.append(noticeRootEle);
        new Vue({
            render: (h) => h(noticeWebpack)
        }).$mount(noticeRootEle);
    }
    renderNotice();
});