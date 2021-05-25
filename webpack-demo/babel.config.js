module.exports = {
    presets: [
        '@vue/babel-preset-jsx', // vue 支持 jsx 跟 tsx
        [
            '@babel/preset-env', // 添加 preset-env 预设做语法转换跟 polyfill 添加
            {
                corejs: 3,
                useBuiltIns: 'usage',
                modules: false,
            },
        ],
    ],
    plugins: [
        [
        '@babel/plugin-transform-runtime', // 利用 runtime 做 helpers 跟 regenerator 设置
            {
                corejs: false,
                helpers: true,
                useESModules: false,
                regenerator: true,
                absoluteRuntime: './node_modules',
            },
        ],
    ],
};