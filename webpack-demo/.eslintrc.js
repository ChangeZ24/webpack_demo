module.exports = {
    env: {
      node: true, // 添加 node 环境
    },
    plugins: [
      'vue', // 添加 eslint-plugin-vue 插件
    ],
    extends: [
      'eslint:recommended', // eslint 推荐语法
      'plugin:vue/recommended', // 使用 vue 推荐语法
      '@vue/typescript/recommended', // 继承 typescript 插件的 recommended 配置
      '@vue/prettier', // 使用 vue 官方推荐的比较好的语法
      '@vue/prettier/@typescript-eslint', // 使用 vue 官方推荐的比较好的 ts 语法
    ],
    rules: {
      // 自定义规则
        semi: [
        // 代码结尾必须使用 “;“ 符号
        'error',
        'always',
        ],
        quotes: [
        // 代码中字符串必须使用 ”” 符号
        'error',
        'double',
        ],
        'no-console': 'error', // 代码中不允许出现 console
    },
};