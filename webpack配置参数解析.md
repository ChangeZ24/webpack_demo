# webpack配置参数解析

## entry

> 入口对象```entry```用于webpack查找开始构建```bundle```的地方，配置方法有多种形式

默认为：```./src/index.js```

<!--more-->

```
module.exports={
    //配置入口
    //字符串形式
    entry: "./src/index.js",    
    //字符串数组形式
    entry: ['./src/index.js'],
    //对象形式
    entry: {
         main: './src/index.js',
    },  
    //多入口形式
    entry:{                  
         main: './src/index.js',
         main2: './src/index2.js',
    }
    //动态入口
    /* 当需要根据请求来编译文件做到懒加载打包输出，则使用动态入口*/
    entry: () => new Promise((resolve) => resolve('./src/index.js'))
}
```

## context

> 上下文```context```配置webpack的基础目录，用于从配置中解析入口起点和```loader```

默认为：```process.cwd()```

```
const path = require('path');
module.exports={
    context: path.resolve(__dirname,'./src'),// context 上下文指向 src 目录
    entry: () => new Promise((resolve) =>resolve('./index.js')),// 利用方法返回一个异步的入口
};
```

## mode

> 选项```mode```告知webpack使用相应环境。可能的值：```none```、```development```、```production```（默认）

### 生产配置Production

> 生产模式用于项目上线发布，打包后生成的dist/main.js文件无法被识别，压缩代码，关闭输出```Console```、```Debugger```，设置```process.env.NODE_ENV```为```production```

```
const path = require('path');
module.exports={
    context: path.resolve(__dirname,'./src'),// context 上下文指向 src 目录
    entry: () => new Promise((resolve) =>resolve('./index.js')),// 利用方法返回一个异步的入口
    mode: 'production',//默认模式
};
```

打包后dist/main.js文件：

![production模式](https://i.loli.net/2021/05/24/6xeFbakX4DQlypZ.png)

### 开发配置Development

> 开发模式用于日常开发调试，打包后生成的dist/main.js文件代码清晰并添加了```sourcemap```，不考虑加载速度等，设置```process.env.NODE_ENV```为```development```

```
const path = require('path');
module.exports={
    context: path.resolve(__dirname,'./src'),// context 上下文指向 src 目录
    entry: () => new Promise((resolve) =>resolve('./index.js')),// 利用方法返回一个异步的入口
    mode: 'development',
};
```

打包后dist/main.js文件：

![development模式](https://i.loli.net/2021/05/24/IgRNyl3fV61iocu.png)

### 不使用webpack默认mode配置None

> 将mode设置为none则不实用webpack的默认mode配置，生成的dist/main.js文件与development模式相比少了```sourcemap```的生成

```
const path = require('path');
module.exports={
    context: path.resolve(__dirname,'./src'),// context 上下文指向 src 目录
    entry: () => new Promise((resolve) =>resolve('./index.js')),// 利用方法返回一个异步的入口
    mode: 'none',
};
```

打包后dist/main.js文件：

![development模式](https://i.loli.net/2021/05/24/IgRNyl3fV61iocu.png)

## output

> 配置output包含一组选项，指示webpack如何输出及在哪输出```bundle```、```asset```和其他导报webpack载入的内容

### path

> path为文件输出目录，对应一个绝对路径

```
const path = require('path');
module.exports={
    context: path.resolve(__dirname,'./src'),// context 上下文指向 src 目录
    entry: () => new Promise((resolve) =>resolve('./index.js')),// 利用方法返回一个异步的入口
    mode: 'production',//默认模式
    output: {
        path: path.resolve(__dirname,'./lib'),//修改输出路径为 “webpack_demo/lib”
    }
};
```
### pathinfo

> pathinfo告知webpack在```bundle```中引入所包含模块信息的相关注释，在```development```模式中默认为```true```，在```production```模式中默认为```false```

```
const path = require('path');
module.exports={
    context: path.resolve(__dirname,'./src'),// context 上下文指向 src 目录
    entry: () => new Promise((resolve) =>resolve('./index.js')),// 利用方法返回一个异步的入口
    mode: 'production',//默认模式
    output: {
        path: path.resolve(__dirname,'./lib'),//修改输出路径为 “webpack_demo/lib”
        pathinfo: true,//打开pathinfo
    }
};
```

注释为：

![pathinfo](https://i.loli.net/2021/05/24/yvkopAL8uqJRxHO.png)

在分析```bundle```包时查看此注释可以了解当前```module```的依赖组成

### publicPath

> 当需要按需加载或加载外部资源，使用```publicPath```指定外部资源的路径

```
const path = require('path');

module.exports = {
  mode: 'development', // 测试环境
  context: path.resolve(__dirname, './src'), // context 上下文指向 src 目录
  entry: () => new Promise((resolve) => resolve('./index.js')), // 利用方法返回一个异步的入口
  output: {
    path: path.resolve(__dirname, './lib'), // 修改输出路径为 “sy_webpack-config/lib”
    publicPath: './lib/', // 配置公共路径
  },
};

//可以在入口文件使用运行时的变量__webpack_public_path__指定
document.write('hello webpack！');

// 动态设置 webpack 的 publicpath 路径
__webpack_public_path__ = './lib/';

// 按需引入 girl.js 文件
import('./demo').then((result) => {
  result.default(); // 满足 demo 的需求
});
```

### filename

> 选项filename用于修改输出文件的名称

```
const path = require('path');
module.exports={
    context: path.resolve(__dirname,'./src'),// context 上下文指向 src 目录
    entry: () => new Promise((resolve) =>resolve('./index.js')),// 利用方法返回一个异步的入口
    mode: 'production',//默认模式
    output: {
        path: path.resolve(__dirname,'./lib'),//修改输出路径为 “webpack_demo/lib”
        pathinfo: true,//打开pathinfo
        filename: 'oubput.js',//单入口文件配置
    }
};
//多入口文件配置
filename: '[name].js',//输出文件为main1.js，main2.js，name默认为当前module文件名
```

### chunkFilename

> 选项```chunkFilename```决定非入口chunk文件的名称，不能配置为方法，其他与filename一致

### library

> 用于封装自己的函数库或ui库或二次封装并暴露给外界使用

```
const path = require('path');

module.exports = {
  mode: 'production',
  context: path.resolve(__dirname, '.'),
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, './lib'),
    library: 'webpackSay',
    libraryExport: 'default',
    libraryTarget: 'var',
  },
};
```

- library：封装后打包的名字

- libraryTarget: 配置暴露给外界的方式，即输出的格式

    - 生成一个变量
    
        - var：libraryTarget的默认值，将库入口的返回值生成一个变量

            ```
            //输出main.js为
            var webpackSay=function(e){ ... }
            ```

        - assign：产生一个隐含的全局变量。

            ```
            webpackSay=function(e){ ... }
            ```

    - 生成对象的属性 
    
        - this：将生成的变量赋值给this对象，作为它的属性

        - window：返回值赋值为window的一个属性

        - global：返回值赋值给global的一个属性

            ```
            this['webpackSay']=function(e){...}
            window['webpackSay']=function(e){...}
            global['webpackSay']=function(e){...}
            ```
    
    - 按不同模块生成

        - commonjs/commonjs2：暴露为CommonJS模块

            ```
            //commonjs
            exports['webpackSay'] = function(e){ ... }
            //commonjs2，该方式会直接忽略library的值
            module.exports = function(e){ ... }
            ```

        - amd：暴露为amd模块，需要指定library

            ```
            define('webpackSay', [], function(){
                return function(e){ ... };
            });
            ```

        - umd：暴露为所有模块定义下都可运行的方式，需要指定library

    - 生成为JSONP：将返回值封装到一个JSONP容器中

        ```
        webpackSay(function(e){ ... });
        ```

- libraryExport：默认要导出模块的哪个部分

## module

> webpack中用```require```或```import```引入的都叫module，通过对module选项的配置可以让loader加载对应的模块

### noParse

当使用commonjs模块生成，修改src/index.js文件引入library

<!--more-->

```
import { webpackSay } from '../library'; // 引入 library 的 webpackSay 方法

document.write('fall in love with webpack！');
// 按需引入 girl.js 文件
import('./girl').then((result) => {
  result.default();
  webpackSay(); // 执行 webpackSay 方法
});
```

此时打包编译，代码用```import```或```require```导入时，webpack会再编译一遍```library```，严重影响性能，故可以使用```module.noParse```忽略对library模块的再次编译

```
const path = require('path');

module.exports = {
  mode: 'development', // 测试环境
  context: path.resolve(__dirname, './src'), // context 上下文指向 src 目录
  entry: () => new Promise((resolve) => resolve('./index.js')), // 利用方法返回一个异步的入口
  output: {
    path: path.resolve(__dirname, './lib'), // 修改输出路径为 “sy_webpack-config/lib”
    publicPath: './lib/', // 配置公共路径
    filename: "[name].js", //配置入口最后生成输出文件名称
    chunkFilename: "[name].[chunkhash:8].js" //让它的组成为 `名称.8位内容的hash值.js`
  },
  module:{
      noParse: /(library)/,//过滤掉library模块
  }
};
```

### rules

> 模块rule的集合。当创建模块时，匹配请求的rule数组，修改模块的创建方式，并对模块应用选择对应的loader或修改解析器

```
module.exports = {
      ...
    module: {
        noParse: /(library)/, // 过滤掉 library 模块
        rules: [
            {
                test: /.vue$/, // 设置当前模块的规则
                use: 'vue-loader', // 设置当前模块的加载器
            },
            {
                test: /\.(sass|scss)$/, // 设置当前模块的规则
                use: [ // 设置当前模块的加载器
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
            }
        ]
    },
   ...
};
```

#### 条件Condition

有两种输入值:

1. resource：请求文件的绝对路径,属性```test```、```include```、```exclude```、```resource```对```resource```匹配

2. issuer：被请求资源模块文件的绝对路径，代表导入时的模块路径。属性```issuer```对```issuer```匹配

如：从```app.js```导入```./style.css```模块，则```resource```为```./style.css```，```issuer```为```app.js```

##### Rule.test

>为```Rule.resource.test```的简写。提供了```Rule.test```就不能再提供```Rule.resource```

- 字符串：匹配输入必须以提供的字符串开始，目录绝对路径或文件绝对路径

```
 {
     test: path.resolve(__dirname,'./src/notice-webpack.vue'), // 字符串匹配一个文件，绝对路径
     use: 'vue-loader',
 },
```

- 正则表达式，使用test来验证输入的值

```
  {
    test: /\.vue$/,
    use: 'vue-loader',
  },
```

- 函数：调用输入的函数，必须返回一个真值匹配

```
{
    test: resource => /\.vue$/.test(resource),
    use: 'vue-loader',
},
```

- 条件数组：至少有一个匹配

```
{
    test: [ /\.vue$/ ],
    use: 'vue-loader',
},
```

- 对象：匹配所有属性，每个属性都有一个定义行为

```
{
    test: {
      test: /\.vue$/
    },
    use: 'vue-loader',
},
```

当webpack加载到不支持的文件，在执行```module.build```时会到```module.rule```中找可以解析此文件的```loader```。当在```webpack.config.js```中配置了此loader，webpack就会利用以上的形式找到它，以此来加载此文件。

##### Rule.issuer

> 用来与发布者的request对应的模块项匹配，其用法与```Rule.test```一致

```
//只需要用 vue-loader 加载 sy_webpack-config/src/index.js 下的 notice-webpack.vue 文件

{
test: /\.vue$/,
issuer: [
    // 发布者 issuer 是 index.js 或 notice-webpack.vue 的时候才让加载器加载
    path.resolve(__dirname,"./src/index.js"),
    path.resolve(__dirname,"./src/notice-webpack.vue"),
],
use: 'vue-loader',
}
```

##### Rule.resourceQuery

> webpack 加载获取加载器的时候，会用当前模块来匹配```resourceQuery```条件，表示一个请求资源的参数，用法跟```Rule.test```一样。

```
//当 resourceQuery 有值的时候才匹配 vue-loader
{
     test: /\.vue$/,
     use: 'vue-loader',
     resourceQuery: (query)=>{
        console.log(query)
        return true;
     }
 },
//同时修改入口文件
import noticewebpack from './notice-webpack.vue?inline'; // 导入noticewebpack组件，inline即为resourceQuery
```

##### Rule.use

> 利用```use```指定当前加载器

可配置的值与```Rule.test```一致

- 字符串形式

- 对象形式：当loader需要传递参数时使用

- 数组形式：当需要多个loader加载时使用

- 方法形式：当需要获取某些信息当作参数时使用

```
{
   test: /\.vue$/,
   use: (info)=>[
     {
       loader: 'vue-loader', // 使用 vue-loader 去加载
          options: {}
     }
   ]
 },
```

其中，info可以写为：

- compiler：当前webpack的compiler对象

- issuer：当前模块发布者的路径

- realResource：当前module的绝对路径

- resource：当前module的路径

##### Rule.loader & Rule.options

> 配置```Rule.loader```是```Rule.use: [ { loader } ]```的简写。

参数```Rule.use```跟```Rule.loader```关系就像是```Rule.test```跟```Rule.resource```关系一样

## resolve

> 选项```resolve```可设置模块如何被解析

### resolve.alias

> 创建```import```或```require```中间```request```的别名

<!--more-->

```
//使用alias前
import noticewebpack from './notice-webpack.vue'; // 导入 noticewebpack 组件

//设置module中resolve
module.exports = {
  ...
  resolve: {
        alias: {
            '$NOTICE': path.resolve(__dirname, './src/notice-webpack.vue') // 设置一个别名替换 ./src/notice-webpack.vue 文件
        }
    },
  ...
}

//设置后
import noticewebpack from '$NOTICE'; // 导入 noticewebpack 组件
```

### resolve.mainFields

> 当从```npm```包中导入模块时，```mainFields```决定在```package.json```中使用哪个字段导入模块。根据webpack配置中指定的```target```不同，默认值也不同

- 当```target```为：```webworker```、```web```或没有指定时，默认值为：

```
module.exports = {
  //...
  resolve: {
    mainFields: ['browser', 'module', 'main'], // 顺序从左到右加载
  },
};
```

- 其他```target```，默认值为：

```
module.exports = {
  //...
  resolve: {
    mainFields: ['module', 'main'], // 顺序从左到右加载
  },
};
```

### resolve.extensions

> 自动解析确定的扩展，即确定在加载模块时能省略后缀的文件，默认值为```['.wasm','.mjs','.js','.json']```

```
//配置前
import noticewebpack from './notice-webpack.vue'; // 导入 noticewebpack 组件

//配置extensions参数
 ...
 resolve: {
        alias: {
            '$NOTICE': path.resolve(__dirname, './src/notice-webpack.vue')
        },
        extensions: ['.wasm', '.mjs', '.js', '.json', '.vue'] // 配置后缀自动解析
    },
 ...

// 配置后
import noticewebpack from './notice-webpack'; // 导入 noticewebpack 组件
```

### resolve.enforceExtension

若设置为```true```则不允许有无扩展名的文件

### resolve.modules

> 告知webpack解析模块时应该搜索的目录，绝对路径和相对路径均可使用

添加一个目录到模块搜索目录，此目录优先于```node_modules/```目录进行搜索的话，配置如下：

```
modules: [path.resolve(__dirname, 'src'), 'node_modules'];
```

此时引入src/xxx文件，即```import("./demo").then()```可以省略```.```，直接使用```import("demo").then()```引入

### resolveLoader

> 用于解析webpack的loader包

默认值为：

```
{
  modules: [ 'node_modules' ], // 默认的 loader 搜索目录
  extensions: [ '.js', '.json' ], // 默认的 loader 后缀自动解析
  mainFields: [ 'loader', 'main' ] // 默认的 loader 模块入口
}
```

## plugins

> 插件可以时一个```object```或```function```，故plugins为```object```或```function```的集合

```
plugins: [new (require('vue-loader').VueLoaderPlugin)()];
```
