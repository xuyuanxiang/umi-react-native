# umi-react-native

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

使用 [umi](https://umijs.org/) 加速 [react-native](https://reactnative.dev/) 开发效率：

- **零配置**，添加[DvaJS](https://dvajs.com/)，[@ant-design/react-native](https://rn.mobile.ant.design/index-cn)... 等依赖后开箱即用；
- 路由方案默认使用 [umi](https://umijs.org/) 内置的[react-router](https://reacttraining.com/react-router/)，**可选**[react-navigation](https://reactnavigation.org/)。

umi 在 RN 中仅用来生成中间代码（临时文件），介于**编码**和**构建**的之间，旨在引入 umi 的开发姿势来提升 RN 编程体验。

下游可以使用[React Native CLI](https://github.com/react-native-community/cli/blob/master/docs/commands.md#start)来开发和打包，也可以使用像[expo](https://expo.io/)这样的开发工具。

| NPM 包 | 当前版本 | 简介 |
| --- | --- | --- |
| [umi-plugin-antd-react-native](packages/umi-plugin-antd-react-native) | [![npm version](https://img.shields.io/npm/v/umi-plugin-antd-react-native.svg?style=flat-square)](https://www.npmjs.com/package/umi-plugin-antd-react-native) | 为[@ant-design/react-native](https://rn.mobile.ant.design/index-cn)提供按需加载，主题/皮肤定制、预设、切换，国际化等支持。 |
| [umi-preset-react-native](packages/umi-preset-react-native) | [![npm version](https://img.shields.io/npm/v/umi-preset-react-native.svg?style=flat-square)](https://www.npmjs.com/package/umi-preset-react-native) | 基础包，让[umi](https://umijs.org/)具备开发 RN 的能力。**需要 [react-native](https://reactnative.dev/) 0.44.0 及以上版本（>=0.44.0）** |
| [umi-preset-react-navigation](packages/umi-preset-react-navigation) | [![npm version](https://img.shields.io/npm/v/umi-preset-react-navigation.svg?style=flat-square)](https://www.npmjs.com/package/umi-preset-react-navigation) | 使用[react-navigation](https://reactnavigation.org/)替换[react-router](https://reacttraining.com/react-router/)开发地道的原生应用。**需要 [react-native](https://reactnative.dev/) 0.60.0 及以上版本（>=0.60.0）** |

[发布日志](/CHANGELOG.md)

示例工程：[UMIRNExample](https://github.com/xuyuanxiang/UMIRNExample#readme)

## 目录

- [必备](#%E5%BF%85%E5%A4%87)
- [安装](#%E5%AE%89%E8%A3%85)
  - [集成 DvaJS](#%E9%9B%86%E6%88%90-dvajs)
  - [集成 @ant-design/react-native](#%E9%9B%86%E6%88%90-ant-designreact-native)
  - [集成 react-navigation（可选）](#%E9%9B%86%E6%88%90-react-navigation%E5%8F%AF%E9%80%89)
- [配置](#%E9%85%8D%E7%BD%AE)
  - [目前支持的 umi 配置项](#%E7%9B%AE%E5%89%8D%E6%94%AF%E6%8C%81%E7%9A%84-umi-%E9%85%8D%E7%BD%AE%E9%A1%B9)
- [使用](#%E4%BD%BF%E7%94%A8)
  - [开发](#%E5%BC%80%E5%8F%91)
  - [打包](#%E6%89%93%E5%8C%85)
- [路由](#%E8%B7%AF%E7%94%B1)
  - [使用 umi 内置的 react-router](#%E4%BD%BF%E7%94%A8-umi-%E5%86%85%E7%BD%AE%E7%9A%84-react-router)
    - [`Link`组件在 RN 和 DOM 中存在差异](#link%E7%BB%84%E4%BB%B6%E5%9C%A8-rn-%E5%92%8C-dom-%E4%B8%AD%E5%AD%98%E5%9C%A8%E5%B7%AE%E5%BC%82)
    - [没有`NavLink`组件](#%E6%B2%A1%E6%9C%89navlink%E7%BB%84%E4%BB%B6)
    - [新增`BackButton`和`AndroidBackButton`组件](#%E6%96%B0%E5%A2%9Ebackbutton%E5%92%8Candroidbackbutton%E7%BB%84%E4%BB%B6)
  - [使用 react-navigation](#%E4%BD%BF%E7%94%A8-react-navigation)
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
- [FAQ](#faq)
  - [hmrClient.send is not a function](#hmrclientsend-is-not-a-function)
  - [使用 @ant-design/react-native 组件时，报错：Unrecognized font family 'antoutline'](#%E4%BD%BF%E7%94%A8-ant-designreact-native-%E7%BB%84%E4%BB%B6%E6%97%B6%E6%8A%A5%E9%94%99unrecognized-font-family-antoutline)
  - [Unable to Resolve Module in React Native App](#unable-to-resolve-module-in-react-native-app)

## 必备

- RN 工程（已有，或使用`react-native init`新建）；
- umi 3.0 及以上版本。

## 安装

如果没有 RN 工程，则使用`react-native init`得到初始工程：

```npm
npx react-native init UMIRNExample
```

在 RN 工程根目录下使用 yarn 添加`umi`和`umi-preset-react-native`依赖：

```npm
yarn add umi umi-preset-react-native --dev
```

### 集成 DvaJS

在 RN 工程根目录下使用 yarn 添加`@umijs/plugin-dva`依赖：

```npm
yarn add @umijs/plugin-dva --dev
```

_待 yarn 安装完成后开箱即用。_

### 集成 @ant-design/react-native

在 RN 工程目录下，使用 yarn 安装`@ant-design/react-native`:

```npm
yarn add @ant-design/react-native
```

**链接 @ant-design/react-native 字体图标资源文件：**

```npm
yarn react-native link
# 等价于: ./node_modules/.bin/react-native link
```

@ant-design/react-native 当前（2020/05/14）版本：`3.x`。如需使用`4.x`请按照：[安装 & 使用](https://github.com/ant-design/ant-design-mobile-rn/blob/master/README.zh-CN.md#%E5%AE%89%E8%A3%85--%E4%BD%BF%E7%94%A8)操作。

最后安装**umi-plugin-antd-react-native**：

```npm
yarn add umi-plugin-antd-react-native --dev
```

查看详情：[umi-plugin-antd-react-native](/packages/umi-plugin-antd-react-native)

### 集成 react-navigation（可选）

[react-navigation](https://reactnavigation.org/)可作为 umi 默认[react-router](https://reacttraining.com/react-router/)的**替代方案**。

需要 [react-native](https://reactnative.dev/) **0.60.0 及以上版本（>=0.60.x）**

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

## 配置

> All dependencies start with @umijs/preset-、@umijs/plugin-、umi-preset-、umi-plugin- will be registered as plugin/plugin-preset.

_umi 3.x 后会自动探测、装配插件。所以不需要在`.umirc.js`中配置[plugins](https://umijs.org/config#plugins)和[presets](https://umijs.org/config#presets)。_

**在 RN 中集成其他[umi](https://umijs.org/)插件需要开发者自行斟酌。**

[umi](https://umijs.org/)插件包括：

- 内建插件：[@umijs/preset-built-in](https://github.com/umijs/umi/tree/master/packages/preset-built-in)，这一部分是无法拆除的。
- 额外扩展插件：[@umijs/plugins](https://github.com/umijs/plugins)

_与 DOM 无关的[umi](https://umijs.org/)插件都是可以使用的，或者说支持服务端渲染的插件基本也是可以在 RN 运行环境中使用的。_

### 目前支持的 umi 配置项

**umi-preset-react-native**使用 RN 官方的[metro](https://github.com/facebook/metro)打包器。

目前支持的 umi 配置如下（已满足集成一些常用[umi 插件](https://github.com/umijs/plugins)的需要）：

- [x] [alias](https://umijs.org/config#alias)
- [x] [extraBabelPlugins](https://umijs.org/config#extrababelplugins)
- [x] [extraBabelPresets](https://umijs.org/config#extrababelpresets)
- [x] [history](https://umijs.org/config#history)：只能使用：`{ type: 'memory' }`
- [ ] [mock](https://umijs.org/config#mock)：开发中...
- [x] [outputPath](https://umijs.org/config#outputpath)
- [x] [plugins](https://umijs.org/config#plugins)
- [x] [presets](https://umijs.org/config#presets)
- [ ] [proxy](https://umijs.org/config#proxy)：开发中...
- [x] [routes](https://umijs.org/config#routes)
- [x] [singular](https://umijs.org/config#singular)
- [x] [theme](https://umijs.org/config#theme)：集成 [umi-plugin-antd-react-native](/packages/umi-plugin-antd-react-native)后，可覆盖 @ant-design/react-native 的[主题](https://github.com/ant-design/ant-design-mobile-rn/blob/master/components/style/themes/default.tsx)

_上文未列出的[umi 配置](https://umijs.org/config)对 **umi-preset-react-native** 不生效。_

**注意**：

使用**umi-preset-react-native**会在 RN 工程根目录下生成以下临时文件：

- index.js
- babel.config.js
- metro.config.js

`react-native init`得到的这 3 个原文件将会被覆盖。

额外添加 Babel 配置只能在`umirc.js`中使用[extraBabelPlugins](https://umijs.org/config#extrababelplugins)和[extraBabelPresets](https://umijs.org/config#extrababelpresets)配置项。

额外添加[Metro 配置](https://facebook.github.io/metro/docs/configuration)需要使用环境变量：[UMI_ENV](https://umijs.org/docs/env-variables#umi_env)指定要加载的配置文件：`metro.${UMI_ENV}.config.js`。

比如，执行`UMI_ENV=dev umi watch`时，会加载`metro.dev.config.js`文件中的配置，使用[mergeConfig](https://facebook.github.io/metro/docs/configuration#merging-configurations)同`metro.config.js`中的配置进行合并。

## 使用

### 开发

修改`package.json`文件：

```diff
{
  "scripts": {
    "android": "react-native run-android",
    "ios": "react-native run-ios",
    "start": "react-native start",
+   "watch": "umi watch",
    "test": "jest",
    "lint": "eslint ."
  }
}
```

先执行 umi watch 监听源码文件变动，重新生成临时代码：

```npm
yarn watch
```

接下来，另启一个终端，编译并启动 Android 应用：

```npm
yarn android
```

编译并启动 iOS 应用：

```npm
yarn ios
```

### 打包

先使用 umi 生成临时代码：

```npm
umi g tmp
```

再使用[react-native bundle](https://github.com/react-native-community/cli/blob/master/docs/commands.md#bundle)构建离线包（offline bundle)。

## 路由

**umi-preset-react-native**提供了 2 种可相互替代的路由方案：

### 使用 umi 内置的 react-router

[umi](https://umijs.org/)内置了`react-router-dom`，**umi-preset-react-native**使用[alias](https://umijs.org/config#alias)在编译时将其替换为：`react-router-native`。

二者都基于 [react-router](https://reacttraining.com/react-router/)，但存在一些差异。

#### `Link`组件在 RN 和 DOM 中存在差异

以下是`react-router-native` `Link`组件的属性：

```javascript
Link.propTypes = {
  onPress: PropTypes.func,
  component: PropTypes.elementType,
  replace: PropTypes.bool,
  to: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};
```

在 RN 中，只能这样使用`Link`：

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

#### 没有`NavLink`组件

`react-router-native`没有`NavLink`组件，当你尝试引入时会得到`undefined`：

```javascript
import { NavLink } from 'umi';

typeof NavLink === 'undefined'; // true;
```

#### 新增`BackButton`和`AndroidBackButton`组件

对于 RN 应用，需要在[全局 layout](https://umijs.org/docs/convention-routing#%E5%85%A8%E5%B1%80-layout)中使用`BackButton`作为根容器:

```jsx
// layouts/index.js
import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import { BackButton } from 'umi';

const Layout = ({ children }) => {
  return (
    <BackButton>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>{children}</SafeAreaView>
    </BackButton>
  );
};

export default Layout;
```

这样做，当用户使用**Android 系统返回键**时会返回应用的上一个路由，而不是退出应用。

### 使用 react-navigation

#### 扩展配置

以下是安装**umi-preset-react-navigation**后，扩展的 umi [配置](https://umijs.org/zh-CN/docs/config)：

##### reactNavigation

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

#### 扩展运行时配置

查看 umi 文档，了解什么是：[运行时配置](https://umijs.org/zh-CN/docs/runtime-config)。

以下是安装**umi-preset-react-navigation**后，扩展的[运行时配置](https://umijs.org/zh-CN/docs/runtime-config)：

##### getReactNavigationInitialState

异步（async）函数，返回的 promise resolve 后的结果会传给 react-navigation 作为初始状态。

返回类型：`Promise<object | void | undefined>`。

##### getReactNavigationInitialIndicator

自定义初始化 react-navigation 状态过程中的指示器/Loading。通常在实现了上面的`getReactNavigationInitialState`后才会生效。

缺省情况下会使用一个内置的简陋 Loading。

##### onReactNavigationStateChange

异步（async）函数，用于订阅 react-navigation 状态变更通知，在每次路由变动时，接收最新状态。

##### 案例：持久化导航状态

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

#### 扩展路由属性

查看 umi 文档，了解什么是：[扩展路由属性](https://umijs.org/zh-CN/docs/convention-routing#%E6%89%A9%E5%B1%95%E8%B7%AF%E7%94%B1%E5%B1%9E%E6%80%A7)。

##### 案例：单独为某个页面设置导航条

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

#### 页面间跳转

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

#### 页面间传递/接收参数

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

了解详情，请移步至：<a href="https://github.com/xuyuanxiang/umi-react-native/tree/master/packages/umi-preset-react-navigation#readme" target="_blank">umi-preset-react-navigation</a>。

## FAQ

### hmrClient.send is not a function

当出现以下错误时需要升级`metro`至`^0.56.0`：[react-native#issue-26958](https://github.com/facebook/react-native/issues/26958)。

```text
TypeError: hmrClient.send is not a function. (In 'hmrClient.send(JSON.stringify({
  type: 'log-opt-in'
}))', 'hmrClient.send' is undefined)
```

_在 RN 工程`node_modules`目录中找到`metro`并查看版本:_

```shell
cat ./node_modules/metro/package.json | grep version
```

### 使用 @ant-design/react-native 组件时，报错：Unrecognized font family 'antoutline'

[ant-design/ant-design-mobile-rn#issue-194](https://github.com/ant-design/ant-design-mobile-rn/issues/194)：

```npm
yarn react-native unlink && yarn react-native link
```

### Unable to Resolve Module in React Native App

[facebook/react-native#issue-1924](https://github.com/facebook/react-native/issues/1924)：`yarn react-native start --reset-cache`
