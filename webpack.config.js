const path = require("path");

module.exports = {
    mode: 'development', //测试环境
    context: path.resolve(__dirname, "./src"), //context上下文指向src目录
    entry: ()=> new Promise((resolve)=>resolve("./index.js")), //利用方法返回一个异步的入口
    output: {
        path: path.resolve(__dirname, './lib'), //修改输出路径为“webpack_demo/lib”
        publicPath: "./lib/", //配置公共路径
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
    ]
};