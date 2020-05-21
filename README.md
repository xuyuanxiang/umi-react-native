# umi-react-native

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

使用 [umi@3.x](https://umijs.org/) 加速 [react-native](https://reactnative.dev/) 开发效率：

- **零配置**，添加[DvaJS](https://dvajs.com/)，[@ant-design/react-native](https://rn.mobile.ant.design/index-cn)... 等依赖后开箱即用；
- 路由方案默认使用 [umi](https://umijs.org/) 内置的[react-router](https://reacttraining.com/react-router/)，**可选**[react-navigation](https://reactnavigation.org/)。

umi 在 RN 中仅用来生成中间代码（临时文件），介于**编码**和**构建**的之间，旨在引入 umi 的开发姿势来提升 RN 编程体验。

下游可以使用[React Native CLI](https://github.com/react-native-community/cli/blob/master/docs/commands.md#commands)，也可以使用像[expo](https://expo.io/)这样的开发工具。

**umi-preset-react-native**会探测用户工程内的依赖，自动为[React Native CLI](https://github.com/react-native-community/cli/blob/master/docs/commands.md#commands)和[expo](https://expo.io/)生成所需的**配置文件**和**入口文件**。

| NPM 包 | 当前版本 | 简介 |
| --- | --- | --- |
| [umi-plugin-antd-react-native](packages/umi-plugin-antd-react-native) | [![npm version](https://img.shields.io/npm/v/umi-plugin-antd-react-native.svg?style=flat)](https://www.npmjs.com/package/umi-plugin-antd-react-native) | 为[@ant-design/react-native](https://rn.mobile.ant.design/index-cn)提供**按需加载**，**主题**定制、预设、切换，**国际化**支持，在[expo](https://expo.io/)中[链接字体图标](https://rn.mobile.ant.design/docs/react/introduce-cn#%E9%93%BE%E6%8E%A5%E5%AD%97%E4%BD%93%E5%9B%BE%E6%A0%87)。 |
| [umi-preset-react-native](packages/umi-preset-react-native) | [![npm version](https://img.shields.io/npm/v/umi-preset-react-native.svg?style=flat)](https://www.npmjs.com/package/umi-preset-react-native) | 基础包，让[umi](https://umijs.org/)具备开发 RN 的能力。**需要 [react-native](https://reactnative.dev/) 0.44.0 及以上版本（>=0.44.0）** |
| [umi-preset-react-navigation](packages/umi-preset-react-navigation) | [![npm version](https://img.shields.io/npm/v/umi-preset-react-navigation.svg?style=flat)](https://www.npmjs.com/package/umi-preset-react-navigation) | 使用[react-navigation](https://reactnavigation.org/)替换[react-router](https://reacttraining.com/react-router/)开发地道的原生应用。**需要 [react-native](https://reactnative.dev/) 0.60.0 及以上版本（>=0.60.0）** |

## 快速开始

### 使用 React Native CLI

查看示例工程：[UMIRNExample](https://github.com/xuyuanxiang/UMIRNExample#readme)

### 使用 expo

查看示例工程：[UMIExpoExample](https://github.com/xuyuanxiang/UMIExpoExample#readme)

## 文档

- [发布日志](/CHANGELOG.md)
- [命令行工具](/docs/Command.md)
- [配置](/docs/Configuration.md)
- [路由](/docs/Router.md)
- [FAQ](/docs/FAQ.md)
