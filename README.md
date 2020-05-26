# umi-react-native

![](https://img.shields.io/npm/dm/umi-preset-react-native?style=flat-square) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

使用 [umi@3.x](https://umijs.org/) 加速 [react-native](https://reactnative.dev/) 开发效率：

- **零配置**，添加[DvaJS](https://dvajs.com/)，[@ant-design/react-native](https://rn.mobile.ant.design/index-cn)... 等依赖后开箱即用；
- 只需要专注页面 UI 和业务领域模型的实现，所有编译配置，框架运行所需 HOC 和 Context Provider 全部由 umi 搞定；
- 路由方案默认使用 [umi](https://umijs.org/) 内置的[react-router](https://reacttraining.com/react-router/)，**可选**[react-navigation](https://reactnavigation.org/)；
- 启用[dynamicImport](https://umijs.org/config#dynamicimport)配置后，支持切分多 bundle，运行时从应用本地按需加载 JS bundle 文件。

| NPM 包 | 当前版本 | 简介 |
| --- | --- | --- |
| [umi-plugin-antd-react-native](packages/umi-plugin-antd-react-native) | [![npm version](https://img.shields.io/npm/v/umi-plugin-antd-react-native.svg?style=flat)](https://www.npmjs.com/package/umi-plugin-antd-react-native) | 为[@ant-design/react-native](https://rn.mobile.ant.design/index-cn)提供**按需加载**，**主题**定制、预设、切换，**国际化**支持，在[expo](https://expo.io/)中[链接字体图标](https://rn.mobile.ant.design/docs/react/introduce-cn#%E9%93%BE%E6%8E%A5%E5%AD%97%E4%BD%93%E5%9B%BE%E6%A0%87)。 |
| [umi-preset-react-native](packages/umi-preset-react-native) | [![npm version](https://img.shields.io/npm/v/umi-preset-react-native.svg?style=flat)](https://www.npmjs.com/package/umi-preset-react-native) | 基础包，让[umi](https://umijs.org/)具备开发 RN 的能力。**需要 [react-native](https://reactnative.dev/) 0.44.0 及以上版本（>=0.44.0）** |
| [umi-preset-react-navigation](packages/umi-preset-react-navigation) | [![npm version](https://img.shields.io/npm/v/umi-preset-react-navigation.svg?style=flat)](https://www.npmjs.com/package/umi-preset-react-navigation) | 使用[react-navigation](https://reactnavigation.org/)替换[react-router](https://reacttraining.com/react-router/)开发地道的原生应用。**需要 [react-native](https://reactnative.dev/) 0.60.0 及以上版本（>=0.60.0）** |

## 快速开始

umi 在 RN 中仅用来生成中间代码（临时文件），介于**编码**和**构建**的之间，旨在引入 umi 的开发姿势来提升 RN 编程体验。

下游可以使用：

- [React Native CLI](https://github.com/react-native-community/cli/blob/master/docs/commands.md#commands)：RN 官方开发/打包工具；
- [expo](https://expo.io/)：不需要搭建 iOS 和 Android 开发环境，工程目录干净清爽，添加 RN 依赖方便快捷；
- [haul](https://github.com/callstack/haul)：第三方 RN 打包器，使用 webpack。缺点是不支持：Fast Refresh、Live Reloading、Hot Replacement。

**umi-preset-react-native**会探测用户工程内的依赖，自动为这些工具生成所需的**配置文件**和**入口文件**。

通常你只需要选择其中一款，如果全都要请查看：[umi-preset-react-native 扩展配置](https://github.com/xuyuanxiang/umi-react-native/blob/master/docs/Configuration.md#umi-preset-react-native-%E6%89%A9%E5%B1%95%E9%85%8D%E7%BD%AE)。

### 使用 React Native CLI

查看示例工程：[UMIRNExample](https://github.com/xuyuanxiang/UMIRNExample#readme)

### 使用 expo

查看示例工程：[UMIExpoExample](https://github.com/xuyuanxiang/UMIExpoExample#readme)

### 使用 haul

查看示例工程：[UMIHaulExample](https://github.com/xuyuanxiang/UMIHaulExample#readme)

### 切分多 bundle

开发阶段使用：[React Native CLI](https://github.com/react-native-community/cli/blob/master/docs/commands.md#commands)；

构建离线包使用：[haul](https://github.com/callstack/haul)拆包。

查看示例工程：[UMIHaulExample#feature/multibundle](https://github.com/xuyuanxiang/UMIHaulExample/tree/feature/multibundle)

## 文档

- [发布日志](/CHANGELOG.md)
- [命令行工具](/docs/Command.md)
- [配置](/docs/Configuration.md)
- [路由](/docs/Router.md)
- [FAQ](/docs/FAQ.md)

## 测试

**需要搭建 iOS 和 Android 开发环境：[Setting up the development environment](https://reactnative.dev/docs/environment-setup)。**

执行 iOS 端到端测试：

```npm
cd example && yarn e2e:ios
```

_[ios.wdio.config.js](example/ios.wdio.config.js)配置文件中的`deviceName`和`platformVersion`需要根据本机实际情况配置。_

执行 Android 端到端测试：

```npm
cd example && yarn e2e:android
```

_[android.wdio.config.js](example/android.wdio.config.js)配置文件中的`deviceName`和`platformVersion`需要根据本机实际情况配置。_

测试用例：[example/e2e](example/e2e/app.spec.js)。
