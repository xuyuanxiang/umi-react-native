# umi-react-native

[umi](https://umijs.org/) preset plugins for react-native.

> 👷 正在施工...

- [x] umi-preset-react-native
- [ ] umi-plugin-react-native-bundler-metro
- [ ] umi-plugin-react-native-bundler-haul

## 必备

- umi 3.0 及以上版本；
- RN 工程（已有，或使用`react-native init`新建）；

## 安装

二选一：`umi-plugin-react-native-bundler-metro` 和 `umi-plugin-react-native-bundler-haul` 同时安装会导致 umi 报错（`dev-rn`和`build-rn`命令行工具冲突）。

### 选用官方[metro](https://facebook.github.io/metro/)打包

```npm
yarn add umi-preset-react-native umi-plugin-react-native-bundler-metro  --dev
```

#### 注意

`umi-plugin-react-native-bundler-metro`：

```json
{
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

### 选用第三方[haul](https://github.com/callstack/haul)打包

```npm
yarn add umi-preset-react-native umi-plugin-react-native-bundler-haul  --dev
```

#### 注意

`umi-plugin-react-native-bundler-haul`:

```json
{
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

修改`package.json`文件，使用`umi`取代原本的`react-native`：

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

```shell
umi build-rn --platform <ios|android>
```
