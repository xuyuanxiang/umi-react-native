# umi-react-native

[umi](https://umijs.org/) preset plugins for react-native.

> 👷 正在施工...

- [x] umi-react-native-cli：删减版命令行工具（`umi-rn`)，相比 [umi](https://umijs.org/) 移除了强依赖 DOM 的内建（built in）插件，**必需**；
- [x] umi-preset-react-native：react-native 插件集，**必需**；
- [ ] umi-plugin-react-native-bundler-metro：RN 官方 [metro](https://facebook.github.io/metro/) 打包器，与 haul 只能**二选一**；
- [ ] umi-plugin-react-native-bundler-haul：第三方 [haul](https://github.com/callstack/haul) 打包器，与 metro 只能**二选一**。

_内建插件是指[@umijs/preset-built-in](https://github.com/umijs/umi/tree/master/packages/preset-built-in)，而非[@umijs/plugins](https://github.com/umijs/plugins)。_

_与 DOM 无关的[umi](https://umijs.org/)插件都是可以使用的，或者说支持服务端渲染的插件基本也是可以在 RN 运行环境中使用的。_

## 目录

- [必备](#%E5%BF%85%E5%A4%87)
- [安装](#%E5%AE%89%E8%A3%85)
  - [安装`umi-rn`命令行工具](#%E5%AE%89%E8%A3%85umi-rn%E5%91%BD%E4%BB%A4%E8%A1%8C%E5%B7%A5%E5%85%B7)
  - [安装 react-native 预设插件集](#%E5%AE%89%E8%A3%85-react-native-%E9%A2%84%E8%AE%BE%E6%8F%92%E4%BB%B6%E9%9B%86)
  - [安装 react-native 打包器](#%E5%AE%89%E8%A3%85-react-native-%E6%89%93%E5%8C%85%E5%99%A8)
    - [选用官方 metro 打包](#%E9%80%89%E7%94%A8%E5%AE%98%E6%96%B9-metro-%E6%89%93%E5%8C%85)
    - [选用第三方 haul 打包](#%E9%80%89%E7%94%A8%E7%AC%AC%E4%B8%89%E6%96%B9-haul-%E6%89%93%E5%8C%85)
- [使用](#%E4%BD%BF%E7%94%A8)
  - [开发](#%E5%BC%80%E5%8F%91)
  - [构建离线包（offline bundle）](#%E6%9E%84%E5%BB%BA%E7%A6%BB%E7%BA%BF%E5%8C%85offline-bundle)

## 必备

- umi 3.0 及以上版本；
- RN 工程（已有，或使用`react-native init`新建）；

## 安装

### 安装`umi-rn`命令行工具

在 RN 工程内部安装：

```npm
yarn add umi-react-native-cli --dev
```

或者全局安装：

```npm
yarn global add umi-react-native-cli
```

### 安装 react-native 预设插件集

在 RN 工程内部安装：

```npm
yarn add umi-preset-react-native --dev
```

### 安装 react-native 打包器

**二选一，同时安装会导致 umi 报错（`dev`和`build`命令行工具冲突）。**

#### 选用官方 metro 打包

在 RN 工程内部安装：

```npm
yarn add umi-plugin-react-native-bundler-metro  --dev
```

**注意：**

```json
{
  "name": "umi-plugin-react-native-bundler-metro",
  "engines": {
    "node": ">=8.3"
  },
  "peerDependencies": {
    "metro": "^0.58.0",
    "react": "^16.11.0",
    "react-native": ">=0.62.0-rc.0 <1.0.x"
  }
}
```

#### 选用第三方 haul 打包

在 RN 工程内部安装：

```npm
yarn add umi-plugin-react-native-bundler-haul  --dev
```

**注意：**

```json
{
  "name": "umi-plugin-react-native-bundler-haul",
  "engines": {
    "node": ">=10.x"
  },
  "peerDependencies": {
    "react": "^16.8.3",
    "react-native": ">=0.59.0 <1.0.x"
  }
}
```

## 使用

### 开发

修改`package.json`文件，使用`umi-rn`取代`react-native`：

```diff
{
  "scripts": {
    "android": "react-native run-android",
    "ios": "react-native run-ios",
-   "start": "react-native start",
+   "start": "umi-rn dev",
  },
}
```

执行`yarn start`之后，再使用 `yarn android` 或者 `yarn ios`。

### 构建离线包（offline bundle）

```shell
umi-rn build --platform <ios|android>
```
