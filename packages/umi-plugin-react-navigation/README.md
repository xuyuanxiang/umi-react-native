# umi-plugin-react-native-navigation

针对 [react-navigation](https://reactnavigation.org/) 的 [umi](https://umijs.org/) 插件。

可作为 [umi](https://umijs.org/) 内置 [react-router](https://reacttraining.com/react-router/) 的替代方案。

查看如何使用[umi](https://umijs.org/)开发 RN 应用，请移步至：<a href="https://github.com/xuyuanxiang/umi-react-native#readme" target="_blank">umi-react-native</a>。

## 动机

- [react-navigation](https://reactnavigation.org/) 具备原生体验效果；
- 工作中难免会遇到高要求的产品经理。

## 安装

### RN`0.60.x`版本

在 RN 工程根目录，使用 yarn 安装**umi-plugin-react-native-navigation**：

```npm
yarn add umi-plugin-react-native-navigation --dev
```

RN 0.60.0 及以上版本会[自动 Link](https://github.com/react-native-community/cli/blob/master/docs/autolinking.md)原生 iOS/Android 依赖。

**umi-plugin-react-native-navigation**已经内置了[react-navigation](https://reactnavigation.org/)所有依赖的最新版本。

**RN`0.60.x`版本安装至此结束。**

### RN`0.50.x`版本

这些是[react-navigation](https://reactnavigation.org/)的依赖：

- react-native-reanimated
- react-native-gesture-handler
- react-native-screens
- react-native-safe-area-context
- @react-native-community/masked-view

需要按照 react-navigation 的[安装文档](https://reactnavigation.org/docs/getting-started/#installation)操作，将这些依赖安装到 RN 工程本地。

**一定要逐一查看这些依赖的 README 文档**，因为：

1. 以[react-native-gesture-handler](https://github.com/software-mansion/react-native-gesture-handler#react-native-support)为例，对于 RN 0.57.2 及以上版本，需要安装`1.1.x`，不能安装最新版；
2. 大部分依赖使用 yarn/npm 安装完成，还需要 Link 原生 iOS/Android 的依赖，按照这些依赖 README 文档中描述操作。

## 导航条

### 标题

查看[umi#title](https://umijs.org/config#title)配置项。

### 样式

#### 全局设置

#### 单独为某个页面设置

## 页面间跳转

### 命令式

### 申明式
