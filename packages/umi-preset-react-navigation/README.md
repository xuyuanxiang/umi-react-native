# umi-preset-react-navigation

针对 [react-navigation](https://reactnavigation.org/) 的 [umi](https://umijs.org/) 插件集。

支持在 RN 应用中替换 [umi](https://umijs.org/) 默认的 [react-router](https://reacttraining.com/react-router/)。

内置[react-navigation](https://reactnavigation.org/) `5.x` 版本，需要 [react-native](https://reactnative.dev/) **0.60.0 及以上版本（>=0.60.x）**。

_了解如何使用[umi](https://umijs.org/)开发 RN 应用，请移步至：_<a href="https://github.com/xuyuanxiang/umi-react-native#readme" target="_blank">umi-react-native</a>

## 目录

- [安装](#%E5%AE%89%E8%A3%85)
  - [React Native CLI](#react-native-cli)
  - [expo](#expo)
- [使用](https://github.com/xuyuanxiang/umi-react-native/blob/master/docs/Router.md#%E4%BD%BF%E7%94%A8-react-navigation)

## 安装

在 RN 工程根目录下，使用 yarn 安装**umi-preset-react-navigation**：

```npm
yarn add umi-preset-react-navigation --dev
```

接下来，安装[react-navigation](https://reactnavigation.org/)的依赖：

- react-native-reanimated
- react-native-gesture-handler
- react-native-screens
- react-native-safe-area-context
- @react-native-community/masked-view

根据你所使用的 RN 开发工具：

### React Native CLI

使用`yarn`安装[react-navigation](https://reactnavigation.org/)的依赖：

```npm
yarn add react-native-reanimated react-native-gesture-handler react-native-screens react-native-safe-area-context @react-native-community/masked-view
```

RN **0.60.0 及以上**版本有[自动链接](https://github.com/react-native-community/cli/blob/master/docs/autolinking.md)功能，Android 会自动搞定这些[react-navigation](https://reactnavigation.org/)的原生依赖，但对于**iOS**，待 yarn 安装完成后，还需要进到 ios 目录，使用 pod 安装：

```shell
cd ios && pod install
```

![](https://cdn.xuyuanxiang.me/pod_install_d498622c.png)

_注意：因为添加了原生依赖，需要执行：`yarn ios`和`yarn android`重新编译和启动 iOS 和 Android 工程。_

### expo

使用`expo`安装[react-navigation](https://reactnavigation.org/)的依赖：

```npm
expo install react-native-gesture-handler react-native-reanimated react-native-screens react-native-safe-area-context @react-native-community/masked-view
```
