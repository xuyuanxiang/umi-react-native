# umi-react-native

> 👷 正在施工...

[umi](https://umijs.org/) react-native 插件。

## 进度

- [x] umi-runtime-react-native
- [x] umi-renderer-react-native
- [x] umi-plugin-react-native
- [ ] umi-plugin-react-native-bundler-metro
- [ ] umi-plugin-react-native-bundler-haul

## 必备条件

- RN 工程（已有，或使用`react-native init`新建）；
- [RN 开发环境](https://reactnative.dev/docs/environment-setup)。

## 使用步骤

### 安装

选用官方[metro](https://facebook.github.io/metro/)打包：

```npm
yarn add umi-plugin-react-native umi-plugin-react-native-bundler-metro  --dev
```

选用第三方[haul](https://github.com/callstack/haul)打包：

```npm
yarn add umi-plugin-react-native umi-plugin-react-native-bundler-haul  --dev
```

### 配置

```javascript
// .umirc.js
export default {
  history: {
    type: 'memory',
  },
  'react-native': {
    appKey: 'RNExample',
  },
  plugins: ['umi-plugin-react-native', 'umi-plugin-react-native-bundler-metro'],
  // plugins: ['umi-plugin-react-native', 'umi-plugin-react-native-bundler-haul'],
};
```

**注意：**

- `history`: **必须**设置为`"memory"`，因为 RN 中没有 DOM，使用<s>"browser"</s>或者<s>"hash"</s>时会报错。
- `react-native`：`umi-plugin-react-native`配置项。
  - `appKey`: 选填，缺省值：RN 工程 app.json 文件中的 "name" 字段。
- `plugins`:
  - `umi-plugin-react-native`：**必须**;
  - `umi-plugin-react-native-bundler-metro` 和 `umi-plugin-react-native-bundler-haul`： 二选一。

_`appKey` 即`AppRegistry.registerComponent(appKey, componentProvider);`的第一个参数，在 RN JS 代码域中命名为：`appKey`，在 iOS/Android 代码域中称为：`moduleName`。 是原生层加载 js bundle 文件的必填参数。_

### 开发

可以修改`package.json`文件，使用`umi`取代原本的`react-native`：

```diff
{
  "scripts": {
-   "android": "react-native run-android",
+   "android": "umi rn-run-android",
-   "ios": "react-native rn-run-ios",
+   "ios": "umi run-ios",
-   "start": "react-native start",
+   "start": "umi rn-start",
  },
}
```

### 构建离线包（offline bundle）

```shell
umi rn-bundle --platform <ios|android>
```
