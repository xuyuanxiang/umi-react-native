# umi-react-native

[umi](https://umijs.org/) preset plugins for react-native.

> 👷 正在施工...

- [x] umi-react-native-cli：删减版命令行工具，相比 [umi](https://umijs.org/) 移除了强依赖 DOM 的内建（built in）插件，**可选**；
- [x] umi-preset-react-native：umi-react-native 插件集，**必需**；
- [ ] umi-plugin-react-native-bundler-metro：RN 官方 [metro](https://facebook.github.io/metro/) 打包器，与 haul 只能**二选一**；
- [ ] umi-plugin-react-native-bundler-haul：第三方 [haul](https://github.com/callstack/haul) 打包器，与 metro 只能**二选一**。

## 目录

- [必备](#%E5%BF%85%E5%A4%87)
- [安装](#%E5%AE%89%E8%A3%85)
- [配置](#%E9%85%8D%E7%BD%AE)
- [使用](#%E4%BD%BF%E7%94%A8)
  - [开发](#%E5%BC%80%E5%8F%91)
  - [构建离线包（offline bundle）](#%E6%9E%84%E5%BB%BA%E7%A6%BB%E7%BA%BF%E5%8C%85offline-bundle)

## 必备

- umi 3.0 及以上版本；
- RN 工程（已有，或使用`react-native init`新建）；

## 安装

使用删减版的工具取代[umi](https://umijs.org/)的命令行工具（可选）：

```npm
yarn add umi-react-native-cli --dev
```

安装 react-native 预设插件集：

```npm
yarn add umi-preset-react-native --dev
```

安装打包器，**二选一，同时安装会导致 umi 报错（`dev-rn`和`build-rn`命令行工具冲突）。**

选用官方[metro](https://facebook.github.io/metro/)打包：

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

选用第三方[haul](https://github.com/callstack/haul)打包：

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

## 配置

如果选用删减版的命令行工具：`umi-react-native-cli`，则零配置。

如果使用[umi](https://umijs.org/)的命令行工具，需要配置 history 为 'memory'类型：

```javascript
// .umirc.js
export default {
  history: {
    type: 'memory',
  },
};
```

_[umi](https://umijs.org/) 默认是'browser'，在 RN 中会报错，因为'browser'和'hash'类型都需要 DOM_。

## 使用

### 开发

修改`package.json`文件。

如果选用删减版的`umi-react-native-cli`，则使用`umi-rn`取代`react-native`：

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

如果使用[umi](https://umijs.org/)的命令行工具，则使用`umi`取代`react-native`：

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

### 构建离线包（offline bundle）

如果选用删减版的`umi-react-native-cli`：

```shell
umi-rn build --platform <ios|android>
```

如果使用[umi](https://umijs.org/)的命令行工具：

```shell
umi build-rn --platform <ios|android>
```
