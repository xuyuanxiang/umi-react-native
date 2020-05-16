## <a target="_blank" href="https://github.com/xuyuanxiang/umi-react-native/compare/v0.2.0-alpha.1...v"></a> (2020-05-16)

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




