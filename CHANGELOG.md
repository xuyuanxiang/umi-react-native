## <a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/compare/v0.4.1...v"></a> (2020-05-26)

### <a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/compare/v0.4.0...v0.4.1">0.4.1</a> (2020-05-26)


### 新功能

* ios multibundle supporting (<a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/commit/9666ab4">9666ab4</a>)




## <a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/compare/v0.3.4...v0.4.0">0.4.0</a> (2020-05-26)


### 新功能

* support multiply bundles (<a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/commit/0c0c366">0c0c366</a>)



* 支持使用haul切分多bundle (<a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/commit/c45623e">c45623e</a>)




### <a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/compare/v0.3.3...v0.3.4">0.3.4</a> (2020-05-22)


### 新功能

* support haul (<a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/commit/fa230d2">fa230d2</a>)




### <a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/compare/v0.3.2...v0.3.3">0.3.3</a> (2020-05-21)

### <a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/compare/v0.3.1...v0.3.2">0.3.2</a> (2020-05-21)

### <a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/compare/v0.3.0...v0.3.1">0.3.1</a> (2020-05-20)


### Bug 修复

* 解决umi@3.1.x中api.modifyPaths不生效，absTmpPath的alias依然被设置为'.umi'的问题 (<a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/commit/7e394c9">7e394c9</a>)




## <a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/compare/v0.3.0-alpha.5...v0.3.0">0.3.0</a> (2020-05-20)


### Bug 修复

* Windows path (<a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/commit/a1c7801">a1c7801</a>)




## <a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/compare/v0.3.0-alpha.4...v0.3.0-alpha.5">0.3.0-alpha.5</a> (2020-05-20)


### 新功能

* umi-plugin-antd-react-native 支持在 expo 中为 @ant-design/react-native [链接字体图标](https://rn.mobile.ant.design/docs/react/introduce-cn#%E9%93%BE%E6%8E%A5%E5%AD%97%E4%BD%93%E5%9B%BE%E6%A0%87) (<a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/commit/de8e7c3">de8e7c3</a>)




## <a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/compare/v0.3.0-alpha.3...v0.3.0-alpha.4">0.3.0-alpha.4</a> (2020-05-20)


### Bug 修复

* 将 `@umijs/runtime` 加入 `dependencies`。 (<a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/commit/9fe342d">9fe342d</a>)

  `@umijs/runtime`必须安装到用户 RN 工程的 node_modules 中，否则 umi 会使用 @umijs/preset-built-in/node_modules 目录中的`@umijs/runtime`，导致 RN Haste Module 无法加载。


## <a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/compare/v0.3.0-alpha.2...v0.3.0-alpha.3">0.3.0-alpha.3</a> (2020-05-20)


### Bug 修复

* 将umi默认的临时文件目录由`.umi`修改为：tmp. (<a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/commit/8cd3fd4">8cd3fd4</a>)

  解决：[metro/issues/325](https://github.com/facebook/metro/issues/325)
  这个问题很诡异，直接使用React Native CLI时没问题；但换用expo确加载不到文件。


## <a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/compare/v0.3.0-alpha.1...v0.3.0-alpha.2">0.3.0-alpha.2</a> (2020-05-20)

## <a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/compare/v0.3.0-alpha.0...v0.3.0-alpha.1">0.3.0-alpha.1</a> (2020-05-20)


### Bug 修复

* Unable to resolve .umi/react-native/runtime.ts (<a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/commit/82ac1d5">82ac1d5</a>)




## <a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/compare/v0.2.0-alpha.6...v0.3.0-alpha.0">0.3.0-alpha.0</a> (2020-05-20)


### 新功能

* add NotFound Screen (<a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/commit/c4d59ac">c4d59ac</a>)



* support mutiply bundlers: react-native-cli, haul, expo (<a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/commit/b9368d2">b9368d2</a>)




## <a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/compare/v0.2.0-alpha.5...v0.2.0-alpha.6">0.2.0-alpha.6</a> (2020-05-19)

## <a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/compare/v0.2.0-alpha.4...v0.2.0-alpha.5">0.2.0-alpha.5</a> (2020-05-18)

## <a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/compare/v0.2.0-alpha.3...v0.2.0-alpha.4">0.2.0-alpha.4</a> (2020-05-18)


### Bug 修复

* 替换@umijs/renderer-react，解决RN Fast Refresh 触发时 umi runtime plugin: rootContainer 未执行的问题 (<a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/commit/2cbf82a">2cbf82a</a>)




## <a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/compare/v0.2.0-alpha.2...v0.2.0-alpha.3">0.2.0-alpha.3</a> (2020-05-18)


### 新功能

* React Naitve CLI hooks supporting (<a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/commit/3065d12">3065d12</a>)




## <a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/compare/v0.2.0-alpha.1...v0.2.0-alpha.2">0.2.0-alpha.2</a> (2020-05-18)


### ⚠ 破坏性改动

* 移除子命令：`umi watch`。

### 重构

* 扩展umi generate子命令，新增RN Generator：`umi g rn`。 (<a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/commit/3386006">3386006</a>)

  + `umi g rn --dev`：在 NODE_ENV=development 模式下，启动watch进程，监听源码文件变动并重新生成中间代码临时文件。
  + `umi g rn`：在 NODE_ENV=production 模式下，生成中间代码临时文件。


## <a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/compare/v0.2.0-alpha.0...v0.2.0-alpha.1">0.2.0-alpha.1</a> (2020-05-16)

## <a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/compare/v0.1.0-alpha.3...v0.2.0-alpha.0">0.2.0-alpha.0</a> (2020-05-16)


### ⚠ 破坏性改动

* 去除`umi dev-rn`和`umi dev-build`命令，不再支持chainWebpack配置。新增`umi watch`命令。

### 重构

* 去除第三方haul打包器，换为 RN 官方的 metro。 (<a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/commit/c2f1435">c2f1435</a>)

  原因：haul 不支持 Fast Refresh、Live Reloading功能。


## <a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/compare/v0.1.0-alpha.2...v0.1.0-alpha.3">0.1.0-alpha.3</a> (2020-05-15)


### 新功能

* Work with HOC: withRouter. (<a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/commit/d9f0d49">d9f0d49</a>)




## <a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/compare/v0.1.0-alpha.1...v0.1.0-alpha.2">0.1.0-alpha.2</a> (2020-05-14)


### Bug 修复

* add react-router-config (<a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/commit/8775653">8775653</a>)




## <a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/compare/v0.1.0-alpha.0...v0.1.0-alpha.1">0.1.0-alpha.1</a> (2020-05-14)

## <a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/compare/v0.0.4-alpha.1...v0.1.0-alpha.0">0.1.0-alpha.0</a> (2020-05-14)


### ⚠ 破坏性改动

* You need to follow the [installation document](https://github.com/ant-design/ant-design-mobile-rn#install--usage) to install `@ant-design/react-native` directly.

### 新功能

* 新增umi-preset-react-navigation包，支持使用react-navigation替换react-router。 (<a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/commit/9411fd9">9411fd9</a>)





### 重构

* remove package: `umi-plugin-antd-react-native` (<a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/commit/018b426">018b426</a>)

  Some **peer dependencies** of `@ant-design/react-native` were **excluded** after **4.0.0**.


### <a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/compare/v0.0.4-alpha.0...v0.0.4-alpha.1">0.0.4-alpha.1</a> (2020-05-06)


### Bug 修复

* react-native#issue-26958 (<a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/commit/549be0e">549be0e</a>)




### <a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/compare/v0.0.3-alpha.0...v0.0.4-alpha.0">0.0.4-alpha.0</a> (2020-04-29)


### Bug 修复

* use api.modifyConfig to set mountElementId and history as RN's except (<a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/commit/ab9349b">ab9349b</a>)




### <a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/compare/v0.0.2...v0.0.3-alpha.0">0.0.3-alpha.0</a> (2020-04-29)


### 新功能

* support custom haul configuration (<a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/commit/a1552d0">a1552d0</a>)




### <a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/compare/v0.0.2-alpha.0...v0.0.2">0.0.2</a> (2020-04-29)


### 新功能

* umi-plugin-antd-react-native (<a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/commit/c5d63d1">c5d63d1</a>)



* 支持下列umi配置： (<a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/commit/edff808">edff808</a>)

  + chainWebpack
  + extraBabelPlugins
  + extraBabelPresets

新增`umi-plugin-antd-react-native`用于集成`@ant-design/react-native`。


### <a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/compare/v0.0.1...v0.0.2-alpha.0">0.0.2-alpha.0</a> (2020-04-28)


### 新功能

* @umijs/plugin-dva (<a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/commit/ad49ec4">ad49ec4</a>)




### <a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/compare/v0.0.1-alpha.2...v0.0.1">0.0.1</a> (2020-04-28)

### <a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/compare/v0.0.1-alpha.1...v0.0.1-alpha.2">0.0.1-alpha.2</a> (2020-04-28)

### <a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/compare/v0.0.1-alpha.0...v0.0.1-alpha.1">0.0.1-alpha.1</a> (2020-04-28)

### <a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/compare/4ec155a...v0.0.1-alpha.0">0.0.1-alpha.0</a> (2020-04-28)


### Bug 修复

* can not find haul (<a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/commit/fbf5c13">fbf5c13</a>)





### 新功能

* build-rn done (<a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/commit/1a79262">1a79262</a>)



* bundler-haul done (<a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/commit/e7cce93">e7cce93</a>)



* dev-rn done (<a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/commit/35d0707">35d0707</a>)



* metro dev server (<a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/commit/bf32fda">bf32fda</a>)



* renderer & runtime (<a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/commit/4ec155a">4ec155a</a>)




