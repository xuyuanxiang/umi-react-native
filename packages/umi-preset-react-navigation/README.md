# umi-plugin-react-native-navigation

[umi](https://umijs.org/) 插件，支持使用 [react-navigation](https://reactnavigation.org/) 替换 [umi](https://umijs.org/) 内置的 [react-router](https://reacttraining.com/react-router/)。

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

**umi-plugin-react-native-navigation**内置了[react-navigation](https://reactnavigation.org/)所有依赖最新版本。

在 RN 工程根目录，使用 yarn 安装**umi-plugin-react-native-navigation**即可：

```npm
yarn add umi-plugin-react-native-navigation --dev
```

RN **0.60.0 及以上**版本有[自动链接](https://github.com/react-native-community/cli/blob/master/docs/autolinking.md)功能，Android 会自动搞定这些[react-navigation](https://reactnavigation.org/)的原生依赖，但对于**iOS**还需要进到 ios 目录，使用 pod 安装：

```shell
cd ios && pod install
```

**注意：**

虽然有[自动链接](https://github.com/react-native-community/cli/blob/master/docs/autolinking.md)功能，如果还是出现了原生代码报错，在 RN 工程根目录下手动重新链接一下：

```npm
yarn react-native unlink && yarn react-native link
# ./node_modules/.bin/react-native unlink && ./node_modules/.bin/react-native link
```

因为添加了原生依赖，需要执行：`yarn ios`和`yarn android`重新编译和启动 iOS 和 Android 工程。

**RN`0.60.x`版本安装至此结束。**

### RN`0.50.x`版本

按照[react-navigation](https://reactnavigation.org/)的[安装文档](https://reactnavigation.org/docs/getting-started/#installation)操作，将所有[react-navigation](https://reactnavigation.org/)所需依赖安装到 RN 工程本地。

**一定要逐一查看这些依赖的 README 文档**，因为：

1. 需要根据 RN 版本安装对应依赖的版本，以[react-native-gesture-handler](https://github.com/software-mansion/react-native-gesture-handler#react-native-support)为例，RN 0.57.2 及以上版本，需要安装`react-native-gesture-handler@1.1.x`，**不能使用最新版**；
2. 有些[react-navigation](https://reactnavigation.org/)的依赖使用 yarn/npm 安装完成，还需要**手动链接**原生 iOS 和 Android 代码，可以按照这些依赖的 README 文档操作。

## 扩展配置

查看 umi 文档，了解什么是：[配置](https://umijs.org/zh-CN/docs/config)。

以下是安装**umi-plugin-react-native-navigation**后，扩展的[配置](https://umijs.org/zh-CN/docs/config)：

### reactNative

```javascript
// .umirc.js

export default {
  reactNative: {
    type: 'stack',
    safeAreasSupport: true,
    theme: {
      dark: false,
      colors: {
        primary: 'rgb(0, 122, 255)',
        background: 'rgb(242, 242, 242)',
        card: 'rgb(255, 255, 255)',
        text: 'rgb(28, 28, 30)',
        border: 'rgb(224, 224, 224)',
      },
    },
  },
};
```

| 变量名 | 类型 | 说明 | 是否必填 | 默认值 |
| :-- | :-: | :-- | :-: | --: |
| type | enum | 导航类型，可选值：`'stack'`, `drawer`, `bottom-tabs`。 | 否 | 'stack' |
| safeAreasSupport | boolean | 是否适配 iOS Safe Areas(e.g iPhoneX) | 否 | true |
| theme | object | 主题 | 否 | _上面代码示例中所填值_ |

## 扩展运行时配置

查看 umi 文档，了解什么是：[运行时配置](https://umijs.org/zh-CN/docs/runtime-config)。

以下是安装**umi-plugin-react-native-navigation**后，扩展的[运行时配置](https://umijs.org/zh-CN/docs/runtime-config)：

### getReactNavigationInitialState

返回结果会传给 react-navigation 作为初始状态。

### onReactNavigationStateChange

订阅 react-navigation 状态变更通知。

### 案例：持久化导航状态示例

```js
// app.js
import { Linking, Platform } from 'react-native';
/**
 * AsyncStorage 将来会从 react-native 库中移除。
 * 按照 RN 官方文档引用：https://github.com/react-native-community/async-storage
 */
import AsyncStorage from '@react-native-community/async-storage';

const PERSISTENCE_KEY = 'MY_NAVIGATION_STATE';

// 返回之前本地持久化保存的状态，通常用于需要复苏应用、状态恢复的场景。
export async function getReactNavigationInitialState() {
  try {
    const initialUrl = await Linking.getInitialURL();
    if (Platform.OS !== 'web' && initialUrl == null) {
      const savedStateString = await AsyncStorage.getItem(PERSISTENCE_KEY);
      if (savedStateString) {
        return JSON.parse(savedStateString);
      }
    }
  } catch (ignored) {}
}

// 订阅 react-navigation 状态变化通知，每次路由变化时，将导航状态持久化保存到手机本地。
export async function onReactNavigationStateChange({ state }) {
  if (state) {
    await AsyncStorage.setItem(PERSISTENCE_KEY, JSON.stringify(state));
  }
}
```

- 如果你需要用到`@react-native-community/async-storage`请按照[https://github.com/react-native-community/async-storage](https://github.com/react-native-community/async-storage)安装；
- 安装完成后，记得进到 ios 目录使用 pod 安装原生依赖：`cd ios && pod install && cd -`，之后记得使用`yarn ios`和`yarn android`重新编译，启动原生 App。

## 扩展路由属性

查看 umi 文档，了解什么是：[扩展路由属性](https://umijs.org/zh-CN/docs/convention-routing#%E6%89%A9%E5%B1%95%E8%B7%AF%E7%94%B1%E5%B1%9E%E6%80%A7)

### 案例：单独为某个页面设置导航条

```jsx
import React from 'react';
import { Text } from 'react-native';

function HomePage() {
  return <Text>Home Page</Text>;
}

// 扩展路由属性:
HomePage.title = 'Home Page';
HomePage.headerTintColor = '#000000';
HomePage.headerTitleStyle = {
  fontWeight: 'bold',
};
HomePage.headerStyle = {
  backgroundColor: '#ffffff',
};

export default HomePage;
```

**这里的`title`属性会覆盖`.umirc.js`中的全局[title](https://umijs.org/config#title)配置。**

## 导航条

### 设置导航条标题

查看[title](https://umijs.org/config#title)配置项。

### 设置导航条样式

### 设置导航条左/右按钮

### 全局设置导航条

### 单独为某个页面设置导航条

### 隐藏导航条

## 页面间跳转

### 使用命令式

### 使用申明式

### 传递/接收参数
