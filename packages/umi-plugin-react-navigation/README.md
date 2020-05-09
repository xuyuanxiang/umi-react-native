# umi-plugin-react-native-navigation

[umi](https://umijs.org/) 插件，使用 [react-navigation](https://reactnavigation.org/) 替换 [umi](https://umijs.org/) 内置的 [react-router](https://reacttraining.com/react-router/)。

_查看如何使用[umi](https://umijs.org/)开发 RN 应用，请移步至：_<a href="https://github.com/xuyuanxiang/umi-react-native#readme" target="_blank">umi-react-native</a>

## 动机

- [react-navigation](https://reactnavigation.org/) 具备原生体验效果；
- 工作中难免会遇到高要求的产品经理。

## 安装

这些是[react-navigation](https://reactnavigation.org/)的依赖：

- react-native-reanimated
- react-native-gesture-handler
- react-native-screens
- react-native-safe-area-context
- @react-native-community/masked-view

### RN`0.60.x`版本

在 RN 工程根目录，使用 yarn 安装**umi-plugin-react-native-navigation**：

```npm
yarn add umi-plugin-react-native-navigation --dev
```

**umi-plugin-react-native-navigation**内置[react-navigation](https://reactnavigation.org/)所有依赖最新版本。

RN **0.60.0 及以上**版本有[自动链接](https://github.com/react-native-community/cli/blob/master/docs/autolinking.md)功能，Android 会自动搞定这些原生依赖，但对于**iOS**还需要进到 ios 目录，使用 pod 安装原生依赖：

```shell
cd ios && pod install
```

**RN`0.60.x`版本安装至此结束。**

### RN`0.50.x`版本

需要按照 react-navigation 的[安装文档](https://reactnavigation.org/docs/getting-started/#installation)操作，将所有依赖安装到 RN 工程本地。

**一定要逐一查看这些依赖的 README 文档**，因为：

1. 以[react-native-gesture-handler](https://github.com/software-mansion/react-native-gesture-handler#react-native-support)为例，对于 RN 0.57.2 及以上版本，需要安装`1.1.x`，不能安装最新版；
2. 大部分依赖使用 yarn/npm 安装完成，还需要**手动链接**，可以按照这些依赖的 README 文档操作。

## 导航条

### 设置导航条标题

查看[umi#title](https://umijs.org/config#title)配置项。

### 设置导航条样式

### 设置导航条左/右按钮

### 全局设置导航条

### 单独为某个页面设置导航条

### 隐藏导航条

## 页面间跳转

### 使用命令式

### 使用申明式

### 传递/接收参数
