# webpack_demo

配置参数解析

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
