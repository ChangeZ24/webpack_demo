const path = require('path');
module.exports={
    context: path.resolve(__dirname,'./src'),// context 上下文指向 src 目录
    entry: () => new Promise((resolve) =>resolve('./index.js')),// 利用方法返回一个异步的入口
    mode: 'production',//默认模式
    output: {
        path: path.resolve(__dirname,'./lib'),//修改输出路径为 “webpack_demo/lib”
        pathinfo: true,//打开pathinfo
        filename: 'oubput.js',
    }
};