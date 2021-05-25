const path = require("path");

module.exports = {
    mode: 'production', //测试环境
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
        new (require("vue-loader").VueLoaderPlugin)(),
        { // 引入 webpack-bundle-analyzer 插件
            apply: compiler => {
                if(compiler.options.mode === "production"){// 生产环境使用
                    new (require("webpack-bundle-analyzer").BundleAnalyzerPlugin)({
                        analyzerHost: "0.0.0.0", // 服务器 host
                        analyzerPort: "8080"// 服务器端口号
                    }).apply(compiler);
                }
            }
        }
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
    optimization: {
        minimize: true, // 开启代码压缩
        minimizer: [ // 自定义压缩规则
            {
                apply: compiler => {
                    // Lazy load the Terser plugin
                    const TerserPlugin = require("terser-webpack-plugin");
                    const SourceMapDevToolPlugin = require("webpack/lib/SourceMapDevToolPlugin");
                    new TerserPlugin({
                        cache: true,
                        parallel: true,
                        sourceMap: // 是否开启 sourceMap
                            (compiler.options.devtool && /source-?map/.test(compiler.options.devtool)) ||
                            (compiler.options.plugins &&
                                compiler.options.plugins.some(p => p instanceof SourceMapDevToolPlugin)),
                        terserOptions: {
                            compress: {
                                drop_console: true, // 删除 console
                            }
                        }
                    }).apply(compiler);
                }
            }
        ],
        splitChunks: {
            chunks: "all", // 设置所有 chunk 都支持分包
            cacheGroups: {
                default: false, // 禁止掉默认的 default 分包规则
                vendors: false, // 禁止掉默认的 vendors 分包规则
                customer: { // 自定义分包规则
                    name: "notice-webpack", // 分包后新 chunk 名称
                    test: (chunk)=>{
                        return /library/.test(chunk.request) // library 下的模块需要拆分
                    },
                    minSize: 0, // 包大小不限制
                    priority: -20 // 优先级
                }
            }
        },
        runtimeChunk: "single"
    }
};