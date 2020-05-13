# umi-preset-react-navigation

支持在 RN 应用中 使用 [react-navigation](https://reactnavigation.org/) 替换 [umi](https://umijs.org/) 内置的 [react-router](https://reacttraining.com/react-router/)。

_了解如何使用[umi](https://umijs.org/)开发 RN 应用，请移步至：_<a href="https://github.com/xuyuanxiang/umi-react-native#readme" target="_blank">umi-react-native</a>

## 动机

- [react-navigation](https://reactnavigation.org/) 具备原生体验效果；
- 还可以更好，突破自我，体现价值；
- 工作中难免会遇到高要求的产品经理。

## 安装

这些是[react-navigation](https://reactnavigation.org/)的依赖：

- react-native-reanimated
- react-native-gesture-handler
- react-native-screens
- react-native-safe-area-context
- @react-native-community/masked-view

**强烈推荐**使用 RN 0.60.0 及以上版本，否则安装会及其繁琐。

### RN`0.60.x`版本

**umi-preset-react-navigation**内置了[react-navigation](https://reactnavigation.org/)所有依赖最新版本。

在 RN 工程根目录，使用 yarn 安装**umi-preset-react-navigation**即可：

```npm
yarn add umi-preset-react-navigation --dev
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

每次添加原生依赖，都需要执行：`yarn ios`和`yarn android`重新编译和启动 iOS 和 Android 工程。

**RN`0.60.x`版本安装至此结束。**

### RN`0.50.x`版本

按照[react-navigation](https://reactnavigation.org/)的[安装文档](https://reactnavigation.org/docs/getting-started/#installation)操作，将所有[react-navigation](https://reactnavigation.org/)所需依赖安装到 RN 工程本地。

**一定要逐一查看这些依赖的 README 文档**，因为：

1. 需要根据 RN 版本安装对应依赖的版本，以[react-native-gesture-handler](https://github.com/software-mansion/react-native-gesture-handler#react-native-support)为例，RN 0.57.2 及以上版本，需要安装`react-native-gesture-handler@1.1.x`，**不能使用最新版**；
2. 有些[react-navigation](https://reactnavigation.org/)的依赖使用 yarn/npm 安装完成，还需要**手动链接**原生 iOS 和 Android 代码，可以按照这些依赖的 README 文档操作。

## 扩展配置

以下是安装**umi-preset-react-navigation**后，扩展的 umi [配置](https://umijs.org/zh-CN/docs/config)：

### reactNavigation

全都是选填参数，下面示例中填入的是默认值，等价于不填：

```javascript
// .umirc.js
export default {
  reactNavigation: {
    // 使用 ant-design 默认配色作为 Navigation 的默认主题
    theme: {
      dark: false,
      colors: {
        primary: '#108ee9',
        background: '#ffffff',
        card: '#ffffff',
        text: '#000000',
        border: '#dddddd',
      },
    },
    type: 'stack', // Navigator 类型
    enableSafeAreasSupport: true, // 默认启用对 iOS Safe Areas 的适配/支持
  },
};
```

| 变量名                 | 类型    | 说明                                                   |                 默认值 |
| :--------------------- | :------ | :----------------------------------------------------- | ---------------------: |
| type                   | enum    | 导航类型，可选值：`'stack'`, `drawer`, `bottom-tabs`。 |                'stack' |
| enableSafeAreasSupport | boolean | 是否适配 iOS Safe Areas。                              |                   true |
| theme                  | object  | 初始主题，将来考虑支持运行时切换主题/皮肤。            | _上面代码示例中所填值_ |

## 扩展运行时配置

查看 umi 文档，了解什么是：[运行时配置](https://umijs.org/zh-CN/docs/runtime-config)。

以下是安装**umi-preset-react-navigation**后，扩展的[运行时配置](https://umijs.org/zh-CN/docs/runtime-config)：

### getReactNavigationInitialState

异步（async）函数，返回的 promise resolve 后的结果会传给 react-navigation 作为初始状态。

返回类型：`Promise<object | void | undefined>`。

### getReactNavigationInitialIndicator

自定义初始化 react-navigation 状态过程中的指示器/Loading。通常在实现了上面的`getReactNavigationInitialState`后才会生效。

缺省情况下：

1. 如果**未启用**[dynamicImport](https://umijs.org/config#dynamicimport)配置，则会使用一个内置的简陋 Loading；
2. 如果**启用**[dynamicImport](https://umijs.org/config#dynamicimport)配置，则会使用`dynamicImport.loading`；
   1. 如果未实现自定义的`dynamicImport.loading`，[dynamicImport](https://umijs.org/config#dynamicimport)默认的 Loading 同样也很简陋。

### onReactNavigationStateChange

异步（async）函数，用于订阅 react-navigation 状态变更通知，在每次路由变动时，接收最新状态。

### 案例：持久化导航状态

RN 工程根目录下`app.js`文件：

```js
// app.js
import { Linking, Platform, Text } from 'react-native';
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

// 自定义返回初始状态过程中显示的Loading，只有实现了 getReactNavigationInitialState 才会生效。
export function getReactNavigationInitialIndicator() {
  // 下面这个就是内置的简陋Loading：
  return ({ error, isLoading }) => {
    if (__DEV__) {
      if (isLoading) {
        return React.createElement(Text, null, 'Loading...');
      }
      if (error) {
        return React.createElement(
          View,
          null,
          React.createElement(Text, null, error.message),
          React.createElement(Text, null, error.stack),
        );
      }
    }
    return React.createElement(Text, null, 'Loading...');
  };
}

// 订阅 react-navigation 状态变化通知，每次路由变化时，将导航状态持久化保存到手机本地。
export async function onReactNavigationStateChange(state) {
  if (state) {
    await AsyncStorage.setItem(PERSISTENCE_KEY, JSON.stringify(state));
  }
}
```

- 如果你需要用到`@react-native-community/async-storage`请按照[https://github.com/react-native-community/async-storage](https://github.com/react-native-community/async-storage)安装；
- 安装完成后，记得进到 ios 目录使用 pod 安装原生依赖：`cd ios && pod install && cd -`，之后记得使用`yarn ios`和`yarn android`重新编译，启动原生 App。

## 扩展路由属性

查看 umi 文档，了解什么是：[扩展路由属性](https://umijs.org/zh-CN/docs/convention-routing#%E6%89%A9%E5%B1%95%E8%B7%AF%E7%94%B1%E5%B1%9E%E6%80%A7)。

### 案例：单独为某个页面设置导航条

使用[扩展路由属性](https://umijs.org/zh-CN/docs/convention-routing#%E6%89%A9%E5%B1%95%E8%B7%AF%E7%94%B1%E5%B1%9E%E6%80%A7)定制顶部导航条：

```jsx
import React from 'react';
import { Text } from 'react-native';

function HomePage({ navigation }) {
  // 处理导航条右侧按钮点击事件
  function onHeaderRightPress() {
    // do something...
  }

  // 设置导航条右侧按钮
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button type="primary" size="small" onPress={onHeaderRightPress}>
          弹窗
        </Button>
      ),
    });
  }, [navigation]);

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
// headerRight 也可以写在这里：
// HomePage.headerRight = () => (
//  <Button type="primary" size="small">
//    弹窗
//  </Button>
// );

export default HomePage;
```

**如果页面的`title`属性未设置，则使用`.umirc.js`中的全局[title](https://umijs.org/config#title)。**

## 应用内部页面跳转

### 使用命令式

### 使用申明式

### 传递和接收参数

## DeepLink

> 什么是 DeepLink ？
>
> 移动端深度链接。这是一种通过 URI：`schema://path?query` 链接到 app 特定位置的一种跳转技术，不单是简单地通过网页、app 等打开目标 app，还能达到利用传递标识携带参数跳转至不同页面的效果。
>
> TODO: 还未来得及实践，案例未完善。
