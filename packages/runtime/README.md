# umi-react-native-runtime

在 RN 环境下，替换`@umijs/runtime`。

`@umijs/runtime`中 dynamic 缺省（默认）loading 使用了 HTML p 标签和 br 标签。

当用户启用[dynamicImport](https://umijs.org/config#dynamicimport)，并且没有实现自定义的 Loading 组件时，在 RN 中运行会报错，这里做了 Monkey Patch。

`@umijs/runtime` 导出的是`react-router-dom`，在 RN 中需要换为：`react-router-native`。

`react-router-dom`和`react-router-native`大部分组件都导出自`react-router`，但存在以下差异：

- `react-router-native`中没有`NavLink`组件。
- `react-router-dom`中没有`BackButton`和`AndroidBackButton`组件。
- 二者的`Link`组件是不同的实现。
