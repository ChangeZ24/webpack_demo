const path = require('path');
const Config = require('webpack-chain');
const config = new Config();

config
    .mode('production') // 配置 mode
    .context(path.resolve(__dirname, './src')) // context 上下文指向 src 目录
    .output.path(path.resolve(__dirname, './lib')) // 修改输出路径为 “sy_webpack-config/lib”
    .publicPath('/lib/') // 配置公共路径
    .filename('[name].js') // 配置入口最后生成输出文件名称
    .chunkFilename('[name].[chunkhash:8].js') // 让它的组成为：名称 +.8 位内容的 hash 值 +.js
    .end()
    .module.noParse(/(library)/) // 过滤掉 library 模块
    .rule('vue') // vue-loader 配置
    .test(/\.vue$/)
    .use('vue-loader')
    .loader('vue-loader')
    .end()
    .end()
    .rule('sass') // sass-loader 配置
    .test(/\.(sass|scss)$/)
    .use('style-loader')
    .loader('style-loader')
    .end()
    .use('css-loader')
    .loader('css-loader')
    .end()
    .use('postcss-loader')
    .loader('postcss-loader')
    .options({
    ident: 'postcss',
    config: {
        path: path.resolve(__dirname, './postcss.config.js'),
    },
    })
    .end()
    .use('sass-loader') // sass-loader 配置
    .loader('sass-loader')
    .end()
    .end()
    .rule('cus-sass') // 自定义 sass-loader 配置
    .test(/\.(sass|scss)$/)
    .enforce('pre')
    .use('cus-sass-loader')
    .loader('cus-sass-loader')
    .end()
    .end()
    .end() // module 配置结束
    .resolve // 配置 resolve
    .alias.set('$NOTICE', path.resolve(__dirname, './src/notice-webpack.vue'))
    .end()
    .extensions.add('.wasm')
    .add('.mjs')
    .add('.js')
    .add('.json')
    .add('.vue')
    .end()
    .modules.add(path.resolve(__dirname, 'src'))
    .add('node_modules')
    .end()
    .end()
    .resolveLoader // 配置 resolveLoader
    .modules.add(path.resolve(__dirname, 'loaders'))
    .add('node_modules')
    .end()
    .end()
    .plugin('vue-loader-plugin') // 配置 vue-loader-plugin
    .use(require('vue-loader').VueLoaderPlugin, [])
    .end()
    .plugin('webpack-bundle-analyzer') // 配置 webpack-bundle-analyzer
    .use({
    apply: (compiler) => {
        if (compiler.options.mode === 'production') {
        new (require('webpack-bundle-analyzer').BundleAnalyzerPlugin)({
            analyzerHost: '0.0.0.0',
            analyzerPort: '8080',
        }).apply(compiler);
        }
    },
    })
    .end()
    .devServer.host('0.0.0.0') // 如果你希望服务器外部可访问
    .disableHostCheck(true) // 关闭白名单校验
    .before(function (app, devServer, compiler) {
    const glob = require('glob');
    const mockPaths = `${path.join(__dirname, './mock')}/*.js`; // 获取所有的 mock 函数
    glob(mockPaths, function (er, files) {
        files.forEach((mockFile) => {
        // 遍历所有的 mock 函数
        const mockFunc = require(mockFile);
        const methodName = path.basename(mockFile).split('.')[0];
        app.all('/' + methodName, mockFunc); // 添加 mock 函数到服务器
        });
    });
    })
    .contentBase(path.resolve(__dirname, './public')) // 设置一个 express 静态目录
    .historyApiFallback({
    disableDotRule: true, // 禁止在链接中使用 "." 符号
    rewrites: [
        { from: /^\/$/, to: '/index.html' }, // 将所有的 404 响应重定向到 index.html 页面
    ],
    })
    .hot(true) // 打开页面热更新功能
    .sockPort('location') // 设置成平台自己的端口
    .end() // server 配置结束
    .devtool('source-map')
    .externals({
    vue: 'Vue',
    })
    .optimization // 配置 optimization
    .minimizer('terser-webpack-plugin')
    .use({
    apply: (compiler) => {
        // Lazy load the Terser plugin
        const TerserPlugin = require('terser-webpack-plugin');
        const SourceMapDevToolPlugin = require('webpack/lib/SourceMapDevToolPlugin');
        new TerserPlugin({
        cache: true,
        parallel: true,
        // 是否开启 sourceMap
        sourceMap:
            (compiler.options.devtool &&
            /source-?map/.test(compiler.options.devtool)) ||
            (compiler.options.plugins &&
            compiler.options.plugins.some(
                (p) => p instanceof SourceMapDevToolPlugin
            )),
        terserOptions: {
            compress: {
            drop_console: true, // 删除 console
            },
        },
        }).apply(compiler);
    },
    })
    .end()
    .splitChunks({
    chunks: 'all', // 设置所有 chunk 都支持分包
    cacheGroups: {
        default: false, // 禁止掉默认的 default 分包规则
        vendors: false, // 禁止掉默认的 vendors 分包规则
        customer: {
        // 自定义分包规则
        name: 'notice-webpack', // 分包后新 chunk 名称
        test: (chunk) => {
            return /library/.test(chunk.request); // library 下的模块需要拆分
        },
        minSize: 0, // 包大小不限制
        priority: -20, // 优先级
        },
    },
    })
    .runtimeChunk('single');
const rawConfig = config.toConfig();
rawConfig.entry = () => new Promise((resolve) => resolve('./index.js')); // 配置入口
module.exports = rawConfig;