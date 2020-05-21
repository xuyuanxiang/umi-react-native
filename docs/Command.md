## 命令行工具

**umi-preset-react-native**额外扩展了[umi generate](https://umijs.org/zh-CN/docs/cli#umi-generate)命令：

### 开发

开发过程中，执行：

```npm
umi g rn --dev
```

强制在 NODE_ENV=development 模式下，启动 watch 进程，监听源码文件变动并重新生成中间代码临时文件。

之后需要**另启一个命令行终端**，

- 如果使用[React Native CLI](https://github.com/react-native-community/cli/blob/master/docs/commands.md#commands) 则使用`react-native start`, `react-native run-ios`, `react-native run-android`。
- 如果使用[expo](https://expo.io/learn)，则使用`expo start`。

### 打包

在构建 RN 离线包（offline bundle）前需要执行：

```npm
umi g rn
```

强制在 NODE_ENV=production 模式下，生成中间代码临时文件。
