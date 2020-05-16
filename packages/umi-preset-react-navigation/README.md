# umi-preset-react-navigation

针对 [react-navigation](https://reactnavigation.org/) 的 [umi](https://umijs.org/) 插件集。

支持在 RN 应用中替换 [umi](https://umijs.org/) 默认的 [react-router](https://reacttraining.com/react-router/)。

内置[react-navigation](https://reactnavigation.org/) `5.x` 版本，需要 [react-native](https://reactnative.dev/) **0.60.0 及以上版本（>=0.60.x）**。

_了解如何使用[umi](https://umijs.org/)开发 RN 应用，请移步至：_<a href="https://github.com/xuyuanxiang/umi-react-native#readme" target="_blank">umi-react-native</a>

## 目录

- [动机](#%E5%8A%A8%E6%9C%BA)
- [安装](#%E5%AE%89%E8%A3%85)
- [扩展配置](#%E6%89%A9%E5%B1%95%E9%85%8D%E7%BD%AE)
  - [reactNavigation](#reactnavigation)
- [扩展运行时配置](#%E6%89%A9%E5%B1%95%E8%BF%90%E8%A1%8C%E6%97%B6%E9%85%8D%E7%BD%AE)
  - [getReactNavigationInitialState](#getreactnavigationinitialstate)
  - [getReactNavigationInitialIndicator](#getreactnavigationinitialindicator)
  - [onReactNavigationStateChange](#onreactnavigationstatechange)
  - [案例：持久化导航状态](#%E6%A1%88%E4%BE%8B%E6%8C%81%E4%B9%85%E5%8C%96%E5%AF%BC%E8%88%AA%E7%8A%B6%E6%80%81)
- [扩展路由属性](#%E6%89%A9%E5%B1%95%E8%B7%AF%E7%94%B1%E5%B1%9E%E6%80%A7)
  - [案例：单独为某个页面设置导航条](#%E6%A1%88%E4%BE%8B%E5%8D%95%E7%8B%AC%E4%B8%BA%E6%9F%90%E4%B8%AA%E9%A1%B5%E9%9D%A2%E8%AE%BE%E7%BD%AE%E5%AF%BC%E8%88%AA%E6%9D%A1)
- [页面间跳转](#%E9%A1%B5%E9%9D%A2%E9%97%B4%E8%B7%B3%E8%BD%AC)
- [页面间传递/接收参数](#%E9%A1%B5%E9%9D%A2%E9%97%B4%E4%BC%A0%E9%80%92%E6%8E%A5%E6%94%B6%E5%8F%82%E6%95%B0)
- [DeepLink](#deeplink)

## 动机

- [react-navigation](https://reactnavigation.org/) 具备原生体验效果；
- 还可以更好，突破自我，体现价值；
- 工作中难免会遇到高要求的产品经理。

## 安装

以下是[react-navigation](https://reactnavigation.org/)的依赖：

- react-native-reanimated
- react-native-gesture-handler
- react-native-screens
- react-native-safe-area-context
- @react-native-community/masked-view

必须全部安装到 RN 工程本地：

```yarn
yarn add react-native-reanimated react-native-gesture-handler react-native-screens react-native-safe-area-context @react-native-community/masked-view
```

RN **0.60.0 及以上**版本有[自动链接](https://github.com/react-native-community/cli/blob/master/docs/autolinking.md)功能，Android 会自动搞定这些[react-navigation](https://reactnavigation.org/)的原生依赖，但对于**iOS**，待 yarn 安装完成后，还需要进到 ios 目录，使用 pod 安装：

```shell
cd ios && pod install
```

![](https://cdn.xuyuanxiang.me/pod_install_d498622c.png)

最后，使用 yarn 安装**umi-preset-react-navigation**：

```npm
yarn add umi-preset-react-navigation --dev
```

_注意：因为添加了原生依赖，需要执行：`yarn ios`和`yarn android`重新编译和启动 iOS 和 Android 工程。_

## 扩展配置

以下是安装**umi-preset-react-navigation**后，扩展的 umi [配置](https://umijs.org/zh-CN/docs/config)：

### reactNavigation

`theme`字段选填，下面示例中填入的是默认值，等价于不填：

```javascript
// .umirc.js
export default {
  reactNavigation: {
    // 使用 ant-design 默认配色作为导航条的默认主题
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
  },
};
```

## 扩展运行时配置

查看 umi 文档，了解什么是：[运行时配置](https://umijs.org/zh-CN/docs/runtime-config)。

以下是安装**umi-preset-react-navigation**后，扩展的[运行时配置](https://umijs.org/zh-CN/docs/runtime-config)：

### getReactNavigationInitialState

异步（async）函数，返回的 promise resolve 后的结果会传给 react-navigation 作为初始状态。

返回类型：`Promise<object | void | undefined>`。

### getReactNavigationInitialIndicator

自定义初始化 react-navigation 状态过程中的指示器/Loading。通常在实现了上面的`getReactNavigationInitialState`后才会生效。

缺省情况下会使用一个内置的简陋 Loading。

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
import { Button } from '@ant-design/react-native';

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

## 页面间跳转

查看 umi 文档：[页面间跳转](https://umijs.org/zh-CN/docs/navigate-between-pages)，姿势保持不变。

使用**声明式**的`Link`组件时需要注意，在 RN 中 与 DOM 存在较大差异：

```jsx
import React from 'react';
import { Link } from 'umi';
import { List } from '@ant-design/react-native';

const Item = List.Item;

function Index() {
  return (
    <List>
      <Link to="/home" component={Item} arrow="horizontal">
        主页
      </Link>
      <Link to="/login" component={Item} arrow="horizontal">
        登录页
      </Link>
    </List>
  );
}
```

使用**命令式**跳转页面时，只能使用`history`的 API，**umi-preset-react-navigation**目前还不支持使用[react-navigation](https://reactnavigation.org/)提供的`navigation`来跳转，只能做导航条设置之类的操作。

## 页面间传递/接收参数

在`IndexPage`点击`Link`，携带`query`参数路由到`HomePage`:

```jsx
import React from 'react';
import { Link } from 'umi';
import { List } from '@ant-design/react-native';

const Item = List.Item;

export default function IndexPage() {
  return (
    <List>
      <Link to="/home?name=bar" component={Item} arrow="horizontal">
        主页
      </Link>
    </List>
  );
}
```

```jsx
export default function HomePage({ route }) {
  console.log(route); // route 属性字段查看下面

  // ...
}
```

`route`属性示例：

```json
{ "key": "/home-WnnfQomYXFls0kS0v0lxo", "name": "/home", "params": { "name": "bar" } }
```

## DeepLink

> 什么是 DeepLink ？
>
> 移动端深度链接。这是一种通过 URI：`schema://path?query` 链接到 app 特定位置的一种跳转技术，不单是简单地通过网页、app 等打开目标 app，还能达到利用传递标识携带参数跳转至不同页面的效果。
>
> TODO: 还未来得及实践，案例未完善。
