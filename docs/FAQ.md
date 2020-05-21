## 目录

- [hmrClient.send is not a function](#hmrclientsend-is-not-a-function)
- [使用 @ant-design/react-native 组件时，报错：Unrecognized font family 'antoutline'](#%E4%BD%BF%E7%94%A8-ant-designreact-native-%E7%BB%84%E4%BB%B6%E6%97%B6%E6%8A%A5%E9%94%99unrecognized-font-family-antoutline)
- [Unable to Resolve Module in React Native App](#unable-to-resolve-module-in-react-native-app)

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

终极清缓存方案：

MacOS

```shell
watchman watch-del-all && rm -fr $TMPDIR/react-* && rm -fr $TMPDIR/metro-* && rm -fr $TMPDIR/haste-map-* && rm -fr node_modules && yarn cache clean --force && yarn && yarn start --reset-cache
```

Windows

```shell
del %appdata%\Temp\react-* & del %appdata%\Temp\metro-* & del %appdata%\Temp\haste-map-* & cd android & gradlew clean & cd .. & del node_modules/ & yarn cache clean --force & yarn & yarn start --reset-cache
```
