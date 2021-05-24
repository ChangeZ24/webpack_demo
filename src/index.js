import {webpackSay} from '../library';
import Vue from 'vue';
import noticewebpack from './notice.vue';

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
            render: (h) => h(noticewebpack),
        }).$mount(noticeRootEle);
    }
    renderNotice();
});