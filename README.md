# umi-react-native

[![npm version](https://img.shields.io/npm/v/umi-preset-react-native.svg?style=flat-square)](https://www.npmjs.com/package/umi-preset-react-native) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

针对 [react-native](https://reactnative.dev/) 应用的 [umi](https://umijs.org/) 插件集。

- **零配置**，添加[DvaJS](https://dvajs.com/)，[@ant-design/react-native](https://rn.mobile.ant.design/index-cn)... 依赖后开箱即用，只需专注于业务代码；
- 路由方案默认使用 umi 内置的[react-router](https://reacttraining.com/react-router/)，可平滑替换为[react-navigation](https://reactnavigation.org/)；
- 支持切分多 bundle，运行时按需加载 bundle，降低内存开销，提升首屏加载速度；

[发布日志](/CHANGELOG.md)

## 目录

- [必备](#%E5%BF%85%E5%A4%87)
- [安装](#%E5%AE%89%E8%A3%85)
  - [集成 DvaJS](#%E9%9B%86%E6%88%90-dvajs)
  - [集成 @ant-design/react-native](#%E9%9B%86%E6%88%90-ant-designreact-native)
- [使用](#%E4%BD%BF%E7%94%A8)
  - [配置](#%E9%85%8D%E7%BD%AE)
    - [目前支持的 umi 配置项](#%E7%9B%AE%E5%89%8D%E6%94%AF%E6%8C%81%E7%9A%84-umi-%E9%85%8D%E7%BD%AE%E9%A1%B9)
    - [umi-preset-react-native 扩展配置](#umi-preset-react-native-%E6%89%A9%E5%B1%95%E9%85%8D%E7%BD%AE)
  - [开发](#%E5%BC%80%E5%8F%91)
  - [打包](#%E6%89%93%E5%8C%85)
- [路由](#%E8%B7%AF%E7%94%B1)
  - [使用 umi 内置的 react-router](#%E4%BD%BF%E7%94%A8-umi-%E5%86%85%E7%BD%AE%E7%9A%84-react-router)
    - [`Link`组件在 RN 和 DOM 中存在差异](#link%E7%BB%84%E4%BB%B6%E5%9C%A8-rn-%E5%92%8C-dom-%E4%B8%AD%E5%AD%98%E5%9C%A8%E5%B7%AE%E5%BC%82)
    - [没有`NavLink`组件](#%E6%B2%A1%E6%9C%89navlink%E7%BB%84%E4%BB%B6)
    - [新增`BackButton`和`AndroidBackButton`组件](#%E6%96%B0%E5%A2%9Ebackbutton%E5%92%8Candroidbackbutton%E7%BB%84%E4%BB%B6)
  - [替换为 react-navigation](#%E6%9B%BF%E6%8D%A2%E4%B8%BA-react-navigation)
- [示例](#%E7%A4%BA%E4%BE%8B)
- [深入](#%E6%B7%B1%E5%85%A5)
  - [切分多 bundle](#%E5%88%87%E5%88%86%E5%A4%9A-bundle)
- [FAQ](#faq)
  - [hmrClient.send is not a function](#hmrclientsend-is-not-a-function)
  - [Live Reloading, Fast Refresh, Hot Replacement... 无法使用](#live-reloading-fast-refresh-hot-replacement-%E6%97%A0%E6%B3%95%E4%BD%BF%E7%94%A8)
  - [@ant-design/react-native 组件没有工作（比如：弹窗打不开等等）](#ant-designreact-native-%E7%BB%84%E4%BB%B6%E6%B2%A1%E6%9C%89%E5%B7%A5%E4%BD%9C%E6%AF%94%E5%A6%82%E5%BC%B9%E7%AA%97%E6%89%93%E4%B8%8D%E5%BC%80%E7%AD%89%E7%AD%89)
  - [使用@ant-design/react-native 组件时，报错：Unrecognized font family 'antoutline'](#%E4%BD%BF%E7%94%A8ant-designreact-native-%E7%BB%84%E4%BB%B6%E6%97%B6%E6%8A%A5%E9%94%99unrecognized-font-family-antoutline)

## 必备

- RN 工程（已有，或使用`react-native init`新建）；
- 全局 或 RN 工程本地（内部）安装 umi 3.0 及以上版本。

Node、react、react-native、umi 版本要求：

```json
{
  "name": "umi-preset-react-native",
  "engines": {
    "node": ">=10.x"
  },
  "peerDependencies": {
    "react": "^16.8.3",
    "react-native": ">=0.59.0 <1.0.x",
    "umi": "^3.0.0"
  }
}
```

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

按照[ant-design/ant-design-mobile-rn#安装 & 使用](https://github.com/ant-design/ant-design-mobile-rn/blob/master/README.zh-CN.md#%E5%AE%89%E8%A3%85--%E4%BD%BF%E7%94%A8)安装。

**umi-preset-react-native**已经为`@ant-design/react-native`添加了[**按需加载**](https://rn.mobile.ant.design/docs/react/introduce-cn#%E6%8C%89%E9%9C%80%E5%8A%A0%E8%BD%BD)（[babel-plugin-import](https://github.com/ant-design/babel-plugin-import)）的配置。

## 使用

### 配置

> All dependencies start with @umijs/preset-、@umijs/plugin-、umi-preset-、umi-plugin- will be registered as plugin/plugin-preset.

_umi 3.x 后会自动探测、装配插件。所以不需要在`.umirc.js`中配置[plugins](https://umijs.org/config#plugins)和[presets](https://umijs.org/config#presets)。_

**在 RN 中集成其他[umi](https://umijs.org/)插件需要开发者自行斟酌。**

[umi](https://umijs.org/)插件包括：

- 内建插件：[@umijs/preset-built-in](https://github.com/umijs/umi/tree/master/packages/preset-built-in)，这一部分是无法拆除的。
- 额外扩展插件：[@umijs/plugins](https://github.com/umijs/plugins)

_与 DOM 无关的[umi](https://umijs.org/)插件都是可以使用的，或者说支持服务端渲染的插件基本也是可以在 RN 运行环境中使用的。_

#### 目前支持的 umi 配置项

**umi-preset-react-native**使用[haul](https://github.com/callstack/haul)打包器。

目前支持的 umi 配置如下（已满足集成一些常用[umi 插件](https://github.com/umijs/plugins)的需要）：

- [x] [alias](https://umijs.org/config#alias)
- [x] [chainWebpack](https://umijs.org/config#chainwebpack)：其中`createCSSRule`不生效，使用`lodash.defaultsDeep(userConfig, haulWebapckConfig)`合并，这里注入的用户配置优先级高于[haul](https://github.com/callstack/haul)配置
- [x] [dynamicImport](https://umijs.org/config#dynamicimport)
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

_上文未列出的[umi 配置](https://umijs.org/config)对 **umi-preset-react-native** 不生效。_

[haul](https://github.com/callstack/haul)使用的 devServer 是[hapi](https://hapi.dev/)，目前还不支持扩展额外的 hapi 插件（中间件），暂时无法支持[mock](https://umijs.org/config#mock)和[proxy](https://umijs.org/config#proxy)功能。

#### umi-preset-react-native 扩展配置

```javascript
// .umirc.js
export default {
  reactNative: {
    appKey: require('./app.json').name,
    version: require('react-native/package.json').version,
  },
  haul: {
    bundles: {
      index: {
        entry: './umi.ts',
      },
    },
  },
};
```

- `reactNative`：选填，默认值：上面代码示例中的值；
- `haul`：选填，默认值：上面代码示例中的值，即[Project Configuration](https://github.com/callstack/haul/blob/master/docs/Configuration.md#project-configuration-reference)。

### 开发

修改`package.json`文件，使用`umi`取代`react-native`：

```diff
{
  "scripts": {
    "android": "react-native run-android",
    "ios": "react-native run-ios",
-   "start": "react-native start",
+   "start": "umi dev-rn",
  },
}
```

执行`yarn start`之后，再使用 `yarn android` 或者 `yarn ios`。

### 打包

构建离线包（offline bundle）：

```shell
umi build-rn --platform <ios|android> --bundle-output <relative/to/output/path/filename> --assets-dest <relative/to/output/path>
```

_`relative/to/output/path`: 表示相对于[outputPath](https://umijs.org/config#outputpath)的路径。_

package.json:

```diff
{
  "scripts": {
    "android": "react-native run-android",
    "ios": "react-native run-ios",
    "start": "umi dev-rn",
+   "build:ios": "NODE_ENV=production umi build-rn --platform ios --bundle-output ios/main.jsbundle --assets-dest ios/assets",
+   "build:android": "NODE_ENV=production umi build-rn --platform android --bundle-output android/index.android.bundle --assets-dest android/assets"
  },
}
```

- 执行`yarn build:ios`：
  1. 构建生成`main.jsbundle`文件到`dist/ios/`目录；
  2. 拷贝静态资源到`dist/ios/assets/`目录。
- 执行`yarn build:android`：
  1. 构建生成`index.android.bundle`文件到`dist/anrdoid/`目录；
  2. 拷贝静态资源到`dist/android/assets/`目录。

_`dist` 是[outputPath](https://umijs.org/config#outputpath)配置项的缺省（默认）值，可在`.umirc.js`中配置其他目录。_

## 路由

### 使用 umi 内置的 react-router

[umi](https://umijs.org/)内置了`react-router-dom`，**umi-preset-react-native**在运行时会将其替换为：`react-router-native`。

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
import { Text, View } from 'react-native';
import { Link } from 'umi';
import { Button } from '@ant-design/react-native';

function Index() {
  return (
    <View>
      <Link to="/details" component={Button}>
        <Text>Go to details</Text>
      </Link>
      <Link to="/login" component={Button}>
        <Text>Go to login</Text>
      </Link>
    </View>
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

这样做，当用户使用**系统返回键**时会返回应用的上一个路由，而不是退出应用。

### 替换为 react-navigation

[react-navigation](https://reactnavigation.org/)可作为 umi 默认[react-router](https://reacttraining.com/react-router/)的**替代方案**。

了解详情，请移步至：<a href="https://github.com/xuyuanxiang/umi-react-native/tree/master/packages/umi-plugin-react-navigation#readme" target="_blank">umi-plugin-react-navigation</a>。

## 示例

[UMIRNExample](https://github.com/xuyuanxiang/UMIRNExample#readme)

## 深入

### 切分多 bundle

参考[react-native-community/react-native-multibundle](https://github.com/react-native-community/react-native-multibundle)。

使用 haul 切分多 bundle：

```javascript
// .umirc.js
export default {
  haul: {
    templates: {
      filename: {
        ios: '[bundleName].ios.bundle',
      },
    },
    features: {
      multiBundle: 2,
    },
    bundles: {
      index: {
        entry: ['./umi.ts', 'react', 'react-native'],
        dll: true,
        type: 'indexed-ram-bundle',
      },
      host: {
        entry: '@/app.js',
        dependsOn: ['index'],
        app: true,
      },
      login: {
        entry: '@/pages/login.js',
        type: 'indexed-ram-bundle',
        dependsOn: ['index'],
        app: true,
      },
      home: {
        entry: '@/pages/home.js',
        type: 'indexed-ram-bundle',
        dependsOn: ['index'],
        app: true,
      },
    },
  },
};
```

**注意**：

- **不要**使用 haul 提供的工具：`makeConfig`和`withPolyfills`；
- **要**保证主 bundle 中必须包含：`./umi.ts`。

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

### Live Reloading, Fast Refresh, Hot Replacement... 无法使用

[haul](https://github.com/callstack/haul)不支持：[haul#issue-682](https://github.com/callstack/haul/issues/682)。

### @ant-design/react-native 组件没有工作（比如：弹窗打不开等等）

按照[@ant-design/react-native](https://rn.mobile.ant.design/docs/react/introduce-cn)文档示例使用组件时，未能达到预期效果，可能是因为没有使用`Provider`作为根节点：

```jsx
// <projectRoot>/layouts/index.js
import React from 'react';
import { Provider } from '@ant-design/react-native';

function Layout({ children }) {
  return <Provider>{children}</Provider>;
}

export default Layout;
```

### 使用@ant-design/react-native 组件时，报错：Unrecognized font family 'antoutline'

[ant-design/ant-design-mobile-rn#issue-194](https://github.com/ant-design/ant-design-mobile-rn/issues/194)中有解决方案。
