import {webpackSay} from "../library"; //引入 library 的 webpackSay 方法
// import Vue from "vue"; //导入vue
import noticeWebpack from "$NOTICE"; //导入noticeWebpack组件

document.write("hello webpack!");
//按需引入demo.js文件
import("./demo").then((result) => {
    result.default();
    webpackSay(); //执行 webpackSay方法
    // 通知webpack函数
    function renderNotice(){
        const noticeRootEle = document.createElement("div");
        document.body.append(noticeRootEle);
        new Vue({
            render: (h) => h(noticeWebpack)
        }).$mount(noticeRootEle);
    }
    renderNotice();
    // mock服务器对接接口，渲染页面
    responseMsg('Lynn').then((msg) => {
        writeToPage(`喂喂喂： ${msg}`);
    }).catch((e) =>{
        writeToPage('喂喂喂，听不到我嘛～');
    });
});

/** 
 * 对话函数
 * @param name
 */
function responseMsg(name){
    return new Promise((resolve,reject) =>{
        const request = new XMLHttpRequest();
        request.onreadystatechange = () => {
            if(request.readyState === 4 && request.status === 200){
                const result = JSON.parse(request.responseText);
                resolve(result.msg);
            }
        };
        request.onerror = (error) => {
            reject(error);
        };
        request.open('GET',`/responseByName?name=${name}`);
        request.setRequestHeader('accept', 'application/json'); // 添加请求头 accept 为 application/json
        request.send(null);
    });
}

/** 
 * 打印msg到页面
 * @param msg
 */
function writeToPage(msg){
    const ele = document.createElement('div');
    ele.innerText = msg;
    document.body.append(ele);
}