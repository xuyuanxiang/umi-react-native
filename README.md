# umi-react-native

[![npm version](https://img.shields.io/npm/v/umi-preset-react-native.svg?style=flat-square)](https://www.npmjs.com/package/umi-preset-react-native) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

针对 [react-native](https://reactnative.dev/) 应用的 [umi](https://umijs.org/) 插件集。

[发布日志](/CHANGELOG.md)

## 目录

- [必备](#%E5%BF%85%E5%A4%87)
- [安装](#%E5%AE%89%E8%A3%85)
- [使用](#%E4%BD%BF%E7%94%A8)
  - [配置](#%E9%85%8D%E7%BD%AE)
    - [目前支持的 umi 配置项](#%E7%9B%AE%E5%89%8D%E6%94%AF%E6%8C%81%E7%9A%84-umi-%E9%85%8D%E7%BD%AE%E9%A1%B9)
    - [umi-preset-react-native 扩展配置](#umi-preset-react-native-%E6%89%A9%E5%B1%95%E9%85%8D%E7%BD%AE)
  - [开发](#%E5%BC%80%E5%8F%91)
  - [打包](#%E6%89%93%E5%8C%85)
- [示例](#%E7%A4%BA%E4%BE%8B)
  - [初始工程](#%E5%88%9D%E5%A7%8B%E5%B7%A5%E7%A8%8B)
  - [集成`umi-preset-react-native`](#%E9%9B%86%E6%88%90umi-preset-react-native)
  - [集成`@umijs/plugin-dva`](#%E9%9B%86%E6%88%90umijsplugin-dva)
  - [集成`@ant-design/react-native`](#%E9%9B%86%E6%88%90ant-designreact-native)
- [深入](#%E6%B7%B1%E5%85%A5)
  - [切分多 bundle](#%E5%88%87%E5%88%86%E5%A4%9A-bundle)

## 必备

- RN 工程（已有，或使用`react-native init`新建）；
- 全局 或 RN 工程本地（内部）安装 umi 3.0 及以上版本。

## 安装

在 RN 工程内部安装：

```npm
yarn add umi-preset-react-native --dev
```

_以下是`umi-preset-react-native`对 Node、react、react-native、umi 版本的要求：_

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

## 使用

### 配置

```javascript
// .umirc.js
export default {
  mountElementId: '',
  history: {
    type: 'memory',
  },
};
```

**注意：RN 环境中没有 DOM 和 BOM， 所以这两项配置为必填，需要覆盖[umi](https://umijs.org/)的默认值，避免运行时进入到调用 DOM/BOM API 的代码分支导致运行错误。**

- `mountElementId`：[umi](https://umijs.org/) 默认值是：`'root'`，在 RN 中**必须覆盖为空字符串**。
- `history`：[umi](https://umijs.org/) 默认值是：`'browser'`，在 RN 中**只能使用：`'memory'`类型**。

> All dependencies start with @umijs/preset-、@umijs/plugin-、umi-preset-、umi-plugin- will be registered as plugin/plugin-preset.

_umi 3.x 后会自动探测、装配插件。所以不需要在`.umirc.js`中配置[plugins](https://umijs.org/config#plugins)和[presets](https://umijs.org/config#presets)。_

**在 RN 中集成其他[umi](https://umijs.org/)插件需要开发者自行斟酌。**

[umi](https://umijs.org/)插件包括：

- 内建插件：[@umijs/preset-built-in](https://github.com/umijs/umi/tree/master/packages/preset-built-in)，这一部分是无法拆除的。
- 额外扩展插件：[@umijs/plugins](https://github.com/umijs/plugins)

_与 DOM 无关的[umi](https://umijs.org/)插件都是可以使用的，或者说支持服务端渲染的插件基本也是可以在 RN 运行环境中使用的。_

`umi-preset-react-native`直接使用[haul](https://github.com/callstack/haul)打包。

[haul](https://github.com/callstack/haul)也是基于`webpack`，理论上是可以和`@umijs/bundler-webpack`整合的。

#### 目前支持的 umi 配置项

仅仅为满足集成一些常用[@umijs/plugins](https://github.com/umijs/plugins)的需要：

- [x] [alias](https://umijs.org/config#alias)
- [x] [chainWebpack](https://umijs.org/config#chainwebpack)：其中`createCSSRule`不生效，使用`lodash.defaultsDeep(userConfig, haulWebapckConfig)`合并，[chainWebpack](https://umijs.org/config#chainwebpack)注入的用户配置优先级高于[haul](https://github.com/callstack/haul)配置
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

_上文未列出的[umi 配置](https://umijs.org/config)对 `umi-preset-react-native` 不生效。RN 开发不同于 Web 开发，基本上无须在编译工具上做过多配置。_

#### umi-preset-react-native 扩展配置

```javascript
// .umirc.js
module.default = {
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

- `reactNative`：选填，默认值：上面代码示例中的值
- `haul`：选填，默认值：上面代码示例中的值，即[Project Configuration](https://github.com/callstack/haul/blob/master/docs/Configuration.md#project-configuration-reference)。

**注意**：不需要使用 haul 提供的工具：`makeConfig`和`withPolyfills`。直接填入[Project Configuration](https://github.com/callstack/haul/blob/master/docs/Configuration.md#project-configuration-reference)的字段即可。

在做多 bundle 切分时，要保证主 bundle 中必须包含`./umi.ts`。

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

## 示例

[UMIRNExample](https://github.com/xuyuanxiang/UMIRNExample#readme)

**需要配置好 RN 开发环境：[Setting up the development environmen](https://reactnative.dev/docs/environment-setup)，才能查看应用运行效果。**

### 初始工程

使用`react-native init`得到初始工程：

```npm
npx react-native init UMIRNExample
```

### 集成`umi-preset-react-native`

添加`umi`和`umi-preset-react-native`依赖：

```npm
yarn add umi umi-preset-react-native --dev
```

### 集成`@umijs/plugin-dva`

添加`@umijs/plugin-dva`依赖：

```npm
yarn add @umijs/plugin-dva --dev
```

### 集成`@ant-design/react-native`

添加[umi-plugin-antd-react-native](/packages/plugin-antd/README.md)依赖：

```npm
yarn add umi-plugin-antd-react-native --dev
```

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
