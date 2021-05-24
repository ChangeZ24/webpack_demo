# webpack源码解析

> webpack是现代```JavaScript```应用程序的静态模块打包器。通过递归地构建依赖关系图，将应用程序需要的每个模块打包成一个或多个bundle

## 基础用法

1. 使用```npm init```命令初始化工程

2. 在src目录创建入口文件index.js

```
import $ from 'jquery'; // 引入 jquery 第三方库
$('#app').text('hello webpack!'); // 使用 jquery 输出 hello webpack
```

<!--more-->

3. 使用```npm install jquery --registry https://registry.npm.taobao.org```安装jquery

4. 使用```npm install -D webpack@4.44.1 webpack-cli --registry https://registry.npm.taobao.org```安装webpack

5. 使用```npx webpack```编译打包。可看到目录中生成了```dist/main.js```文件

6. 创建浏览器入口index.html文件

```
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>webpack基础用法</title>
  </head>
  <body>
    <!-- 创建挂载点 -->
    <div id="app"></div>
    <!-- 引入入口js文件 -->
    <script src="./dist/main.js"></script>
  </body>
</html>
```

7. 可在编译器浏览index.html文件输出的hello webpack

## webpack-cli

在基础用法第5步，使用命令```npx webpack```编译打包，node会自动执行```/node_modules/webpack/bin/webpack.js```文件，从```133行```到```149行```看出```webpack```是最后交给```webpack-cli```命令来执行，即执行```npx webpack```和```npx webpack-cli```的结果是一样的。

```
// 判断是否安装了 webpack-cli，如果没有安装就引导安装，确保存在 webpack-cli
const packageName = 'webpack-cli';
// 执行 webpack-cli
runCommand(packageManager, installOptions.concat(packageName))
  .then(() => {
    require(packageName); // eslint-disable-line
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
```

分析```node_modules/webpack-cli/bin/cli.js```文件可发现```webpack-cli```负责接受用户输入的命令，获取自定义配置文件```webpack.config,js```或```webpackfile.js```。创建一个webpack编译器对象```compiler```并执行```compiler```对象的```run```方法。

## webpack流程图

![webpack流程图](https://i.loli.net/2021/05/22/OtqX5seK1fT6guZ.png)


## 分析webpack初始化过程

在```node_modules/webpack-cli/bin/cli.js```文件中

```
try {
   const webpack = require("webpack"); // 引入 webpack
   compiler = webpack(options); // 创建 webpack 编译器对象 compiler
} catch (err) {......}
```

引入webpack，并返回webpack编译器对象compiler

查看文件```node_modules/webpack/lib/webpack.js```第25行

```
const webpack = (options, callback) => {
  // 加载 webpack 默认配置
  options = new webpackOptionsDefaulter().process(options);
        // 创建 webpack 编译器对象 compiler
        compiler = new Compiler(options.context);
        compiler.options = options;
        // 初始化 webpack 的 log 系统、watch 系统、file 系统
        new NodeEnvironmentPlugin({
            infrastructureLogging: options.infrastructureLogging
        }).apply(compiler);
        // 开始加载插件
        if (options.plugins && Array.isArray(options.plugins)) {
            for (const plugin of options.plugins) {
                if (typeof plugin === "function") {
                    plugin.call(compiler, compiler);
                } else {
                    plugin.apply(compiler);
                }
            }
        }
        compiler.hooks.environment.call();
        compiler.hooks.afterEnvironment.call();
        //根据 wbepack 的默认配置做 webpack 的初始化操作
        compiler.options = new webpackOptionsApply().process(options, compiler);
  if (callback) {
        ...
        // 开始编译
        compiler.run(callback);
    }
    // 返回编译器对象
    return compiler;
}
```

### 加载默认配置webpackOptionsDefaulter

查看```node_modules/webpack/lib/webpackOptionsDefaulter.js```文件第30行，查看```webpackOptionsDefaulter```定义

```
class webpackOptionsDefaulter extends OptionsDefaulter {
    constructor() {
        super();
        // 设置默认的入口文件为 “src/index.js” 文件
        this.set("entry", "./src");

        // 设置默认的开发模式为：测试环境 “eval” 生产环境 “false”
        this.set("devtool", "make", options =>
            options.mode === "development" ? "eval" : false
        );
        // 设置默认上下文目录为 process.cwd()
        this.set("context", process.cwd());
        // 设置 webpack 的默认 target 为 “web”
        this.set("target", "web");
        ...
        // 设置 webpack 的默认输出路径为 “dist” 目录
        this.set("output.path", path.join(process.cwd(), "dist"));

        .........
    }
}

```

由上看出，当没有对webpack做任何配置时，webpack会读取默认配置信息，即默认入口文件```src/index.js```，默认开发环境、上下文目录、默认target、默认输出路径。

即在基础使用中，没有做任何配置，故webpack默认读取```src/index.js```文件打包输出到```dist```目录

### 创建Compiler对象

> 对象```Compiler```类似```webpack```的司机，控制webpack使用

```
const webpack = (options, callback) => {
  // 创建 webpack 编译器对象 compiler
  compiler = new Compiler(options.context);

  ......
}
```

它的方法有

1. run：启动编译

2. newCompilation：创建编译器

3. emitAssets：处理编译后结果。

### 创建node环境

```
const webpack = (options, callback) => {
    ...
    // 初始化 webpack 的 log 系统、watch 系统、file 系统
    new NodeEnvironmentPlugin({
        infrastructureLogging: options.infrastructureLogging
    }).apply(compiler);
    ...
}
```

查看```node_modules/webpack/lib/node/NodeEnvironmentPlugin.js```文件第14行

```
class NodeEnvironmentPlugin {
    apply(compiler) {
        // 创建 webpack 中的 log 系统
        compiler.infrastructureLogger = createConsoleLogger(
            Object.assign(
                {
                    level: "info",
                    debug: false,
                    console: nodeConsole
                },
                this.options.infrastructureLogging
            )
        );
        // 创建 webpack 中的 file 读取系统
        compiler.inputFileSystem = new CachedInputFileSystem(
            new NodeJsInputFileSystem(),
            60000
        );
        const inputFileSystem = compiler.inputFileSystem;
        // 创建 webpack 中的 file 输出系统
        compiler.outputFileSystem = new NodeOutputFileSystem();
        // 创建 webpack 中的 watch 监听文件系统
        compiler.watchFileSystem = new NodeWatchFileSystem(
            compiler.inputFileSystem
        );
        ...
    }
}
```

通过```NodeEnvironmentPlugin```创建文件系统，使```webpack```可以读取、编译、输出文件，同时输出一些log文件

### 加载plugins

```
const webpack = (options, callback) => {
    ...
    // 开始加载插件
    if (options.plugins && Array.isArray(options.plugins)) {
        for (const plugin of options.plugins) {
            // 如果插件是一个方法
            if (typeof plugin === "function") {
                plugin.call(compiler, compiler);
            // 插件为一个对象的时候
            } else {
                plugin.apply(compiler);
            }
        }
    }
    ...
}
```

#### 自定义插件

1. 提供配置文件```webpack.config.js```给```webpack```

```
//创建配置文件
touch webpack.config.js
```

2. 导入一个对象

```
module.exports = {
  plugins: [],
};
```

3. 创建plugins目录

```
mkdir plugins
```

4. 在plugins目录中创建文件function-webpack-plugin.js

```
touch plugins/function-webpack-plugin.js

//文件内容
module.exports = function (compiler) {
  // 利用 webpack 的 log 系统输出一句话
  compiler.infrastructureLogger('Customer', 'error', [
    '我是自定义Function插件',
  ]);
};
```

5. 在plugins目录中创建文件object-webpack-plugin.js

```
class ObjectwebpackPlugin {
  apply(compiler) {
    // 同样利用 webpack 的 log 系统输出一句话
    compiler.infrastructureLogger('Customer', 'error', [
      '我是自定义Object插件',
    ]);
  }
}
module.exports = ObjectwebpackPlugin;
```

6. 在webpack.config.js使用4、5中插件

```
module.exports = {
  plugins: [
    require('./plugins/function-webpack-plugin'), // 引用 function 方式插件
    new (require('./plugins/object-webpack-plugin'))(), // 引用 object 方式插件
  ],
  infrastructureLogging: {
    debug: true, // 开启 webpack 的 log 系统
  },
};
```

7. 执行命令```npx webpack```

![结果](https://i.loli.net/2021/05/22/XolRx52HTQWpPwy.png)

### 根据默认配置初始化webpack

```
const webpackOptionsApply = require("./webpackOptionsApply");
...
const webpack = (options, callback) => {
  ...
  // 根据默认配置初始化 webpack
  compiler.options = new webpackOptionsApply().process(options, compiler);
  ...
}
```

查看文件```node_modules/webpack/lib/webpackOptionsApply.js```第55行

```
...
process(options, compiler) {
    let ExternalsPlugin;
    // 初始化 webpack 的输出路径
    compiler.outputPath = options.output.path;
    // 初始化 webpack 的 records 路径
    compiler.recordsInputPath = options.recordsInputPath || options.recordsPath;
    compiler.recordsOutputPath =
        options.recordsOutputPath || options.recordsPath;
    // 设置当前编译器的 name
    compiler.name = options.name;
        switch (options.target) {
            case "web":
                // 添加浏览器环境的模块生成器模版
                JsonpTemplatePlugin = require("./web/JsonpTemplatePlugin");
                NodeSourcePlugin = require("./node/NodeSourcePlugin");
                new JsonpTemplatePlugin().apply(compiler);
                new FetchCompileWasmTemplatePlugin({
                    mangleImports: options.optimization.mangleWasmImports
                }).apply(compiler);
                // 将模块到一个方法中的模版
                new FunctionModulePlugin().apply(compiler);
                new NodeSourcePlugin(options.node).apply(compiler);
                new LoaderTargetPlugin(options.target).apply(compiler);
                break;
      ...
    // 入口文件加载插件
    new EntryOptionPlugin().apply(compiler);
    // 执行 compiler 对象中的 entryOption 钩子函数
    compiler.hooks.entryOption.call(options.context, options.entry);
    ...
```

> webpackOptionsApply的责任为根据webapck的配置信息加载一些插件。

如上代码中```入口文件加载插件```到```执行compiler对象中的entryOption钩子函数```部分，这里执行了```compiler```对象中的```entryOption```钩子函数。

查看文件```node_modules/webpack/lib/EntryOptionPlugin.js```第20行

```
...
const itemToPlugin = (context, item, name) => {
    // 多入口的时候
    if (Array.isArray(item)) {
        return new MultiEntryPlugin(context, item, name);
    }
    // 单入口的时候
    return new SingleEntryPlugin(context, item, name);
};
module.exports = class EntryOptionPlugin {
    apply(compiler) {
        // 监听 compiler 对象中的 entryOption 钩子函数
        compiler.hooks.entryOption.tap("EntryOptionPlugin", (context, entry) => {
             // entry 可以为一个 string 或数组，名称默认为 “main”
            if (typeof entry === "string" || Array.isArray(entry)) {
                itemToPlugin(context, entry, "main").apply(compiler);
            } else if (typeof entry === "object") { // entry 可以为一个 object
                for (const name of Object.keys(entry)) {
                    itemToPlugin(context, entry[name], name).apply(compiler);
                }
            } else if (typeof entry === "function") { // entry 还可以为一个方法
                new DynamicEntryPlugin(context, entry).apply(compiler);
            }
            return true;
        });
    }
};
```

EntryOptionPlugin监听```compiler```对象中的```entryOption```钩子函数的执行

原基础应用使用的是单入口项目，故在此使用的是SIngleEntryPlugin插件，查看文件```node_modules/webpack/lib/SingleEntryPlugin.js```第40行

```
class SingleEntryPlugin {
    constructor(context, entry, name) {
        this.context = context; // 当前 webpack 的上下文目录
        this.entry = entry; // 入口文件
        this.name = name; // 入口文件的名称
    }
    apply(compiler) {
    ...
        // 监听 compiler 对象的 make 操作
        compiler.hooks.make.tapAsync(
            "SingleEntryPlugin",
            (compilation, callback) => {
                const { entry, name, context } = this;
                const dep = SingleEntryPlugin.createDependency(entry, name);
                // 把入口文件当成一个 dependency 添加到 webpack 进行编译
                compilation.addEntry(context, dep, name, callback);
            }
        );
    }
...
module.exports = SingleEntryPlugin;
```

到此，webpack的初始化过程结束。```webpack```在```SingleEntryPlugin```停止运行等待```compiler```的```make```操作的执行，即webpack编译的开始。


## webpack编译
> webpack的编译分几个阶段进行，分别为创建对象阶段run、解析获取module阶段make、module分包阶段seal、输出打包后文件阶段emit

### 一些定义

- module：webpack中用```require```或```import```引入的都叫module

- chunk：module的一个集合，入口文件就算一个chunk

- dependency：包含一个模块的基本信息，用来创建```module```

- moduleFactory：创建```module```对象的工厂类

- assets：最后输出的资产文件

### 执行compiler.run方法

查看文件```node_modules/webpack/lib/Compiler.js```第247行

```
/**
    webpack 开始工作
*/
run(callback) {
    // 开始执行 beforerun 钩子函数
    this.hooks.beforeRun.callAsync(this, err => {
        if (err) return finalCallback(err);
        // 开始执行 run 钩子函数
        this.hooks.run.callAsync(this, err => {
            if (err) return finalCallback(err);
            // 开始读取记录
            this.readRecords(err => {
                if (err) return finalCallback(err);
                // 开始编译
                this.compile(onCompiled);
            });
        });
    });
}
```

方法```run```最后执行了```compile```方法，即在```compiler```方法执行时，说明```run```阶段已经开始了。

### compile方法定义

在文件660行查看```compile```方法的定义

```
/**
    webpack 开始编译
*/
compile(callback) {
    // 创建编译器参数
    const params = this.newCompilationParams();
    // 调用 beforeCompile 钩子函数
    this.hooks.beforeCompile.callAsync(params, err => {
        // 调用 compile 钩子函数
        this.hooks.compile.call(params);
        // 创建编译器对象
        const compilation = this.newCompilation(params);
        // 调用 compiler 的 make 钩子函数
        this.hooks.make.callAsync(compilation, err => {
            if (err) return callback(err);
            // 调用 finishModules 钩子函数
            compilation.finish(err => {
                if (err) return callback(err);
                // 开始对所有的 modules 进行封装
                compilation.seal(err => {
                    if (err) return callback(err);
                    // 调用 afterCompile 钩子函数
                    this.hooks.afterCompile.callAsync(compilation, err => {
                        if (err) return callback(err);
                        // webpack 编译结束
                        return callback(null, compilation);
                    });
                });
            });
        });
    });
}
```

### run阶段

> 由```compiler.run```方法得知```compiler```方法执行时，说明```run```阶段已经开始

#### 创建NormalModuleFactory和ContextModuleFactory

```
/**
    webpack 开始编译
*/
compile(callback) {
    // 创建编译器参数
    const params = this.newCompilationParams();
    ...
}
/*
    使用方法newCompilationParams()
    创建 NormalModuleFactory 和 ContextModuleFactory
*/
newCompilationParams() {
    const params = {
        normalModuleFactory: this.createNormalModuleFactory(), // NormalModule 的工厂类
        contextModuleFactory: this.createContextModuleFactory(), // ContextModules 的工厂类
        compilationDependencies: new Set()
    };
    return params;
}
```

#### 创建Compilation对象

> 对象```Compilation```对象是webpack的编译器核心对象，被```Compiler```用来创建新的编译或构建。

```
/**
    webpack 开始编译
*/
compile(callback) {
    // 创建编译器参数
    const params = this.newCompilationParams();
    // 调用 beforeCompile 钩子函数
    this.hooks.beforeCompile.callAsync(params, err => {
        // 调用 compile 钩子函数
        this.hooks.compile.call(params);
        // 创建编译器对象
        const compilation = this.newCompilation(params);
    ...
}
/*
    创建 Compilation 对象
*/
newCompilation(params) {
    // 创建 Compilation 对象
    const compilation = this.createCompilation();
    ...
    // 调用 thisCompilation 钩子函数
    this.hooks.thisCompilation.call(compilation, params);
    // 调用 compilation 钩子函数
    this.hooks.compilation.call(compilation, params);
    return compilation;
}
 /**
     创建并返回 Compilation 对象
 */
createCompilation() {
    return new Compilation(this);
}
```

至此，webpack的```run```阶段结束

### make阶段

由```compile```方法得知，```make```阶段开始调用如下：

```
// 调用 compiler 的 make 钩子函数
this.hooks.make.callAsync(compilation, err => {
```

在初始化过程中得知，钩子函数```make```在```SingleEntryPlugin```处被监听，等待make操作的执行。

#### 添加入口文件entry

查看文件```node_modules/webpack/lib/SingleEntryPlugin.js```第46行

```
// 监听 compiler 对象的 make 操作
compiler.hooks.make.tapAsync('SingleEntryPlugin', (compilation, callback) => {
  const { entry, name, context } = this;
  // 创建一个 dependency
  const dep = SingleEntryPlugin.createDependency(entry, name);
  //添加 entry（入口），并将 dependency 添加到 compilation 对象
  compilation.addEntry(context, dep, name, callback);
});
```

查看文件```node_modules/webpack/lib/Compilation.js```第1142行```addEntry```方法的定义

```

addEntry(context, entry, name, callback) {
    // context：默认是我们的工程目录
    // entry：是包含工程目录中的 “/src/index.js” 文件的 “dependency” 对象
    // name：默认是 “main”
    this._addModuleChain( // 通过 dependency 创建 module 并添加至 compilation 对象
        context,
        entry,
        module => {
            this.entries.push(module);
        },
        (err, module) => {
            ...
            // 成功后回到 SingleEntryPlugin 插件
            return callback(null, module);
        }
    );
}
```

查看```_addModuleChain```方法

```
/**
    根据 dependency 添加 module 对象至 compilation 对象
*/
_addModuleChain(context, dependency, onModule, callback) {
    const Dep = /** @type {DepConstructor} */ (dependency.constructor);
    // 获取模块工厂对象
    const moduleFactory = this.dependencyFactories.get(Dep);
        ...
        // 通过模块工厂创建对应的 module 对象
        moduleFactory.create(
            {
                contextInfo: {
                    issuer: "",
                    compiler: this.compiler.name
                },
                context: context,
                dependencies: [dependency]
            },
            (err, module) => {
                ...
    });
}
```

通过调用```moduleFactory```的```create```方法创建```module```对象

若没有定义```moduleFactory```，则webpack默认使用```NormalModuleFactory```创建```NormalModule```

#### 触发ModuleFactory的create方法

之前的基础用法demo中没有自定义```module```和```ModuleFactory```，故webpack使用```NormalModuleFactory```的```create```方法创建，查看文件```/node_modules/webpack/lib/NormalModuleFactory.js```的373行

```
/*
    创建 NormalModule 对象
*/
create(data, callback) {
    // 获取 dependencies
    const dependencies = data.dependencies;
    // 获取上下文目录
    const context = data.context || this.context;
    // 获取 dependency 的文件地址，也就是“项目名/src/index.js”
    const request = dependencies[0].request;
    // 执行 beforeResolve 钩子函数
    this.hooks.beforeResolve.callAsync(
        {
            contextInfo,
            resolveOptions,
            context,
            request,
            dependencies
        },
        (err, result) => {
            ...
            });
        }
    );
}
```

#### 触发ModuleFactory的resolver方法

> 方法```resolver```负责根据传入的```dependency```对象获取模块中的基本信息，根据这些信息返回模块的```loaders```(能处理当前```module```的一个loader集合)、```hash值```、```query```(请求参数)等，用于构建```module```对象的信息，并```new```一个```NormalModule```对象

查看文件```/node_modules/webpack/lib/NormalModuleFactory.js```的123行中```resolver```方法的定义

```
this.hooks.factory.tap("NormalModuleFactory", () => (result, callback) => {
    // 调用 resolver 钩子函数获取 resolver 方法
    let resolver = this.hooks.resolver.call(null);
    // 直接调用 resolver 方法
    resolver(result, (err, data) => {
        this.hooks.afterResolve.callAsync(data, (err, result) => {
            // 调用 createModule 钩子函数
            let createdModule = this.hooks.createModule.call(result);
            if (!createdModule) {
                if (!result.request) {
                    return callback(new Error("Empty dependency (no request)"));
                }
                // 创建 NormalModule 对象
                createdModule = new NormalModule(result);
            }
            createdModule = this.hooks.module.call(createdModule, result);
            return callback(null, createdModule);
        });
    });
});
// 注册 resolver 钩子函数监听
this.hooks.resolver.tap("NormalModuleFactory", () => (data, callback) => {
    ...
    // 返回 resolve 方法
});
```

#### compilateion触发addModule方法

工厂```NormalModuleFactory```创建完```NormalModule```对象后回到```Compilation```的```_addModuleChain```方法，开始添加module

查看文件```node_modules/webpack/lib/Compilation.js```第1085行

```
/**
    根据 dependency 添加 module 对象至 compilation 对象
*/
_addModuleChain(context, dependency, onModule, callback) {
    ...
    // 添加 module 至 compilation
   const addModuleResult = this.addModule(module);
        ...
    });
}
 /*
     添加 module
 */
 addModule(module, cacheGroup) {
    // 添加 module 至 compilation 的 modules 集合中
    ...
    this.modules.push(module);
    return {
        module: module,
        issuer: true,
        build: true,
        dependencies: true
    };
}
```

方法```_addModuleChain```直接调用```addModule```方法将```module```对象添加到```Compilation```的```module```集合中

#### Compilation触发buildModule构建模块

查看文件```node_modules/webpack/lib/Compilation.js```第1111行

```
/**
    根据 dependency 添加 module 对象至 compilation 对象
*/
_addModuleChain(context, dependency, onModule, callback) {
   ...
   // 开始构建当前 module 对象
   this.buildModule(module, false, null, null, err => {
        ...
    });
}
 /*
     构建模块
 */
 buildModule(module, optional, origin, dependencies, thisCallback) {
    // 直接调用 module 的 build 方法构建
    module.build(
        this.options,
        this,
        this.resolverFactory.get("normal", module.resolveOptions),
        this.inputFileSystem,
        error => {
            ...
            // 构建完毕后回到再次 _addModuleChain 方法
            return callback();
        }
    );
}
```

由构建模块可看出，```buildModule```方法执行的是每个```module```对象的```build```方法。在基础使用demo中，则为之前创建的```NormalModule```，查看文件```/node_modules/webpack/lib/NormalModule.js```文件第427行

```
build(options, compilation, resolver, fs, callback) {
  ...
  // 直接调用 dobuild 方法
  return this.doBuild(options, compilation, resolver, fs, err => {
        ...
    });
}

/*
    执行所有的 loader 获取返回结果，根据返回结果创建 loader 加载过后的 source 源码
*/
doBuild(options, compilation, resolver, fs, callback) {
    // 创建执行 loader 的上下文对象
    const loaderContext = this.createLoaderContext(
        resolver,
        options,
        compilation,
        fs
    );
    // 执行所有的 loader
    runLoaders(
        {
            resource: this.resource,
            loaders: this.loaders,
            context: loaderContext,
            readResource: fs.readFile.bind(fs)
        },
        (err, result) => {
            // 根据返回的结果创建 source 源码对象
            this._source = this.createSource(
                this.binary ? asBuffer(source) : asString(source),
                resourceBuffer,
                sourceMap
            );
            this._sourceSize = null;
            this._ast =
                typeof extraInfo === "object" &&
                extraInfo !== null &&
                extraInfo.webpackAST !== undefined
                    ? extraInfo.webpackAST
                    : null;
            // 返回到 buildModule 方法
            return callback();
        }
    );
}
```

上述```doBuild```方法中使用的```runLoaders```方法是单独由第三方库```loader-runner```提供，用来执行所有的```loader```并返回执行后的结果。根据此结果创建```source```对象

#### 执行parse方法解析源码

查看文件```/node_modules/webpack/lib/NormalModule.js```文件第482行

```
build(options, compilation, resolver, fs, callback) {
  ...
  return this.doBuild(options, compilation, resolver, fs, err => {
    // 开始解析 loader 处理过后的源码
    const result = this.parser.parse(
        this._ast || this._source.source(),
        {
            current: this,
            module: this,
            compilation: compilation,
            options: options
        },
        (err, result) => {
            if (err) {
                handleParseError(err);
            } else {
                handleParseResult(result);
            }
        }
    );
  }
}
```

webpack默认支持```JSON```、```JavaScript```代码解析，```JavaScript```解析默认使用```Acorn```框架，```parse```方法主要用来解析代码中的模块定义、获取代码中的模块引用、转换alias、转换自定义变量方法等。

#### addModuleDependencies编译模块中关联的依赖

解析后，```compilation```的```buildModule```结束，开始编译```module```中关联的依赖，查看文件```node_modules/webpack/lib/Compilation.js```第1093行

```
_addModuleChain(context, dependency, onModule, callback) {
   ...
    const afterBuild = () => {
        if (addModuleResult.dependencies) {
            //开始编译模块中关联的依赖
            this.processModuleDependencies(module, err => {
                if (err) return callback(err);
                callback(null, module);
            });
        } else {
            return callback(null, module);
        }
    };
}

processModuleDependencies(module, callback) {
    ...
    //addModuleDependencies方法用来编译模块中关联的依赖，与_addModuleChain类似
    this.addModuleDependencies(
			module,
			sortedDependencies,
			this.bail,
			null,
			true,
			callback
		);
}

```
至此，webpack的```make```阶段结束。

### seal阶段

> seal阶段主要对```modules```做分拣、拆包、封装。

查看文件```/node_modules/webpack/lib/Compiler.js```第675行:

```
compile(callback) {
    // make 阶段开始
    this.hooks.make.callAsync(compilation, err => {
        if (err) return callback(err);
        // make 阶段结束
        compilation.finish(err => {
            if (err) return callback(err);
            // seal 阶段开始
            compilation.seal(err => {
            ...
```

#### 分包优化

查看文件```/node_modules/webpack/lib/Compilation.js```中第1283行seal方法

```
seal(callback) {
    // 开始进行分包优化操作
    this.hooks.optimize.call();
    // 一系列的分包优化操作...
    while (
        this.hooks.optimizeModulesBasic.call(this.modules) ||
        this.hooks.optimizeModules.call(this.modules) ||
        this.hooks.optimizeModulesAdvanced.call(this.modules)
    ) {
        /* empty */
    }
    this.hooks.afterOptimizeModules.call(this.modules);

    while (
        this.hooks.optimizeChunksBasic.call(this.chunks, this.chunkGroups) ||
        this.hooks.optimizeChunks.call(this.chunks, this.chunkGroups) ||
        this.hooks.optimizeChunksAdvanced.call(this.chunks, this.chunkGroups)
    ) {
        /* empty */
    }
    this.hooks.afterOptimizeChunks.call(this.chunks, this.chunkGroups);

    this.hooks.optimizeTree.callAsync(this.chunks, this.modules, err => {
        if (err) {
            return callback(err);
        }

        this.hooks.afterOptimizeTree.call(this.chunks, this.modules);

        while (
            this.hooks.optimizeChunkModulesBasic.call(this.chunks, this.modules) ||
            this.hooks.optimizeChunkModules.call(this.chunks, this.modules) ||
            this.hooks.optimizeChunkModulesAdvanced.call(this.chunks, this.modules)
        ) {
            /* empty */
        }
        this.hooks.afterOptimizeChunkModules.call(this.chunks, this.modules);

        const shouldRecord = this.hooks.shouldRecord.call() !== false;

        this.hooks.reviveModules.call(this.modules, this.records);
        this.hooks.optimizeModuleOrder.call(this.modules);
        this.hooks.advancedOptimizeModuleOrder.call(this.modules);
        this.hooks.beforeModuleIds.call(this.modules);
        this.hooks.moduleIds.call(this.modules);
        this.applyModuleIds();
        this.hooks.optimizeModuleIds.call(this.modules);
        this.hooks.afterOptimizeModuleIds.call(this.modules);

        this.sortItemsWithModuleIds();

        this.hooks.reviveChunks.call(this.chunks, this.records);
        this.hooks.optimizeChunkOrder.call(this.chunks);
        this.hooks.beforeChunkIds.call(this.chunks);
        this.applyChunkIds();
        this.hooks.optimizeChunkIds.call(this.chunks);
        this.hooks.afterOptimizeChunkIds.call(this.chunks);
        ...
    }
```

#### compilation调用createModuleAssets方法

webpack调用```createModuleAssets```方法来提取资产文件最后输出到```dist```目录中，如css中引入的图片等，```css-loader```会将图片当成一个个```module```，用```url-loader```或```file-loader```提取出来当成css模块中资产文件输出到dist

#### compilation调用createChunkAssets方法

查看文件```/node_modules/webpack/lib/Compilation.js```中第1395行seal方法

```
seal(callback) {
        // 分包优化操作
        ...
        // 开始分拣 module 中的资产文件
        this.createModuleAssets();
        ...
        if (this.hooks.shouldGenerateChunkAssets.call() !== false) {
            this.hooks.beforeChunkAssets.call();
            // 开始分拣当前 chunk 中的资产文件
            this.createChunkAssets();
            ...
            });
        });
    });
}
```

方法```createChunkAssets```用来分拣```dist/main.js```中的资产文件

#### 判断Chunk是否包含runtime代码

查看文件```/node_modules/webpack/lib/Compilation.js```中第2111行createChunkAssets方法

```
createChunkAssets() {
    // 遍历所有的 chunk
    for (let i = 0; i < this.chunks.length; i++) {
        const chunk = this.chunks[i];
        chunk.files = [];
        let source;
        let file;
        let filenameTemplate;
        try {
            // 判断 chunk 是否包含 runtime 代码并获取 chunk 模版
            const template = chunk.hasRuntime()
                ? this.mainTemplate
                : this.chunkTemplate;
            // 调用 chunk 模版的 getRenderManifest 方法获取当前 chunk 的所有资产文件
            const manifest = template.getRenderManifest({
                chunk,
                hash: this.hash,
                fullHash: this.fullHash,
                outputOptions,
                moduleTemplates: this.moduleTemplates,
                dependencyTemplates: this.dependencyTemplates
            }); // [{ render(), filenameTemplate, pathOptions, identifier, hash }]
            // 遍历所有的资产清单
            for (const fileManifest of manifest) {
                ...
                // 开始执行渲染，获取最后能被浏览器识别的代码
                source = fileManifest.render();
                ...
                // 开始提交最终打包完毕的资产信息
                this.emitAsset(file, source, assetInfo);
                ...
            }
        }
    }
}
```

webpack判断```chunk```是否是```runtime```，即webpack启动代码（最终能被浏览器识别的```import```、```require```、```export```，默认为```webpackjsonp```）。

如果包含```runtime```则用```mainTemplate```生成最终代码，不包含则用```chunkTemplate```生成。

二者区别仅为是否包含```runtime```代码

至此，```seal```阶段结束。

### emit阶段

> emit阶段根据配置输出文件

seal阶段结束，代码回到```/node_modules/webpack/lib/Compiler.js```660行```run```方法

```
compile(callback) {
    ...
    // seal 阶段开始
    compilation.seal(err => {
        if (err) return callback(err);
        // seal 阶段结束
        this.hooks.afterCompile.callAsync(compilation, err => {
            if (err) return callback(err);
            // 回到 run方法
            return callback(null, compilation);
        });
    });
    ...
}
//run方法
run(callback) {const onCompiled = (err, compilation) => {
        // seal 结束后回到了 run 方法，并准备执行 emitAssets
        this.emitAssets(compilation, err => {
            ...
        });
    };
}
```

#### compiler.emitAssets输出打包过后文件

查看文件```/node_modules/webpack/lib/Compiler.js```的```emitAssets```方法

```
emitAssets(compilation, callback) {
    let outputPath; // 输出目录地址
    const emitFiles = err => {
        // 遍历所有的资产文件
        asyncLib.forEachLimit(
            compilation.getAssets(),
            15,
            ({ name: file, source }, callback) => {
                let targetFile = file;
            ...
            // 使用 webpack 的文件输出系统开始写文件到 outputPath
            this.outputFileSystem.writeFile(targetPath, content, err => {
                if (err) return callback(err);
                this.hooks.assetEmitted.callAsync(file, content, callback);
            });
            ...
    }
```

至此，```emit```阶段结束


