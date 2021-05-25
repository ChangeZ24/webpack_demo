const path = require("path");

module.exports = {
    mode: 'development', //测试环境
    context: path.resolve(__dirname, "./src"), //context上下文指向src目录
    entry: ()=> new Promise((resolve)=>resolve("./index.js")), //利用方法返回一个异步的入口
    output: {
        path: path.resolve(__dirname, './lib'), //修改输出路径为“webpack_demo/lib”
        publicPath: "/lib/", //配置公共路径
        filename: "[name].js", //配置入口最后生成输出文件名称
        chunkFilename: "[name].[chunkhash:8].js" //让它的组成为 `名称.8位内容的hash值.js`
    },
    module: {
        noParse: /(library)/, //过滤掉 library 模块
        rules: [
            {
                test: /\.vue$/,
                use: 'vue-loader'
            },
            {
                test: /\.(sass|scss)$/,
                use: [
                    "style-loader",
                    "css-loader",
                    {
                        loader: "postcss-loader",
                        options: {
                            ident: "postcss",
                            config: {
                                path: path.resolve(__dirname,"./postcss.config.js")
                            }
                        }
                    },
                    "sass-loader"
                ]
            },
            {
                test: /\.(sass|scss)$/,
                loader: path.resolve(__dirname, './loaders/cus-sass-loader.js'),
                enforce: "pre"
            }
        ]
    },
    resolve: {
        alias: {
            '$NOTICE': path.resolve(__dirname, './src/notice-webpack.vue')
        },
        extensions: ['.wasm', '.mjs', '.js', '.json', '.vue'],
        modules: [path.resolve(__dirname, "src"), "node_modules"]
    },
    plugins: [
        new (require("vue-loader").VueLoaderPlugin)()
    ],
    devServer: {
        disableHostCheck: true, //关闭白名单校验
        before(app, devServer, compiler){
            const glob = require("glob");
            const mockPaths = `${path.join(__dirname,'./mock')}/*.js`;//获取所有mock函数
            glob(mockPaths,function(er,files){
                files.forEach((mockFile) => {// 遍历所有mock函数
                    const mockFunc = require(mockFile); // 获取当前mock函数
                    const methodName = path.basename(mockFile).split(".")[0];//获取当前mock名称
                    app.all("/" + methodName, mockFunc); // 添加mock函数到服务器
                });
            });
        },
        contentBase: path.resolve(__dirname, "./public"),
        historyApiFallback:{
            disableDotRule: true,// 禁止在链接中使用.
            rewrites:[
                { //将所有404响应都重定向到index.html
                    from: /ˆ\/$/,
                    to: 'index.html'
                }
            ]
        },
        hot: true, // 打开页面热更新功能
        sockPort: 'location', // 设置成平台自己的端口
        // injectClient: false,
        // open: {
        //     app: ["firefox"]
        // }
    },
    devtool: "cheap-eval-source-map",
    externals: {
        vue: "Vue"
    },
    // performance: {
    //     hints: "error",
    //     maxAssetSize: 1*1024, // 所有资源文件最大限制
    //     assetFilter: function assetFilter(assetFilename) {
    //       return !(/\.map$/.test(assetFilename)); // 忽略掉 source-map 文件
    //     }
    // },
};