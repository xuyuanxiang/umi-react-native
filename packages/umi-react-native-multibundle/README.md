# umi-react-native-multibundle

RN Bridge API (Native Module)，让 JS 层具备按需加载 Bundle 文件的能力，用于拆分多 Bundle。

灵感来自于：[react-native-community/react-native-multibundle](https://github.com/react-native-community/react-native-multibundle)。

[react-native-community/react-native-multibundle](https://github.com/react-native-community/react-native-multibundle) 使用了一个 fork 版本的 react-native: `callstack/react-native#feat/bundle-id-for-multibundle`

使用官方的 react-native 包时，Android 端编译会报错。经实测，只需稍加改动后，在官方 0.62.0 版本上是可以成功从 App 本地加载 bundle 文件的。
