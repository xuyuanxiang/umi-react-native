## 目录

- [hmrClient.send is not a function](#hmrclientsend-is-not-a-function)
- [使用 @ant-design/react-native 组件时，报错：Unrecognized font family 'antoutline'](#%E4%BD%BF%E7%94%A8-ant-designreact-native-%E7%BB%84%E4%BB%B6%E6%97%B6%E6%8A%A5%E9%94%99unrecognized-font-family-antoutline)
- [Unable to Resolve Module in React Native App](#unable-to-resolve-module-in-react-native-app)
- [Attempted to assign to readonly property](#attempted-to-assign-to-readonly-property)

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

[facebook/react-native#issue-1924](https://github.com/facebook/react-native/issues/1924)

#### 初级清缓存方案

MacOS

```shell
watchman watch-del-all && yarn start --reset-cache
```

Window

```shell
yarn start --reset-cache
```

#### 终极清缓存方案

MacOS

```shell
watchman watch-del-all && rm -fr $TMPDIR/react-* && rm -fr $TMPDIR/metro-* && rm -fr $TMPDIR/haste-map-* && rm -fr node_modules && yarn cache clean --force && yarn && yarn start --reset-cache
```

Windows

```shell
del %appdata%\Temp\react-* & del %appdata%\Temp\metro-* & del %appdata%\Temp\haste-map-* & cd android & gradlew clean & cd .. & del node_modules/ & yarn cache clean --force & yarn & yarn start --reset-cache
```

### Attempted to assign to readonly property

使用第三方的[haul](https://github.com/callstack/haul)打包器时，运行时会出现该错误。

原因如下：

[haul](https://github.com/callstack/haul)使用 webpack 打包，其中 babel-loader 的 exclude 配置如下：

```regexp
node_modules(?!.*[\/\\](react|@react-navigation|@react-native-community|@expo|pretty-format|@haul-bundler|metro))
```

因此，能够匹配以上正则的 npm 包全都不会被 babel 编译。

当某个依赖（比如：[@react-native-community/viewpager](https://github.com/react-native-community/react-native-viewpager) ）发布到 npm 的代码不是 ES5 时，就会出现该错误。

_因为 RN 官方的 [metro](https://facebook.github.io/metro/) 会使用 babel 编译所有代码，所以不存在该问题。这些 npm 依赖专门针对 RN 所以未编译为 ES5。_
