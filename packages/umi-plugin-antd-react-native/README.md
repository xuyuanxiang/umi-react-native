# umi-plugin-antd-react-native

针对[@ant-design/react-native](https://rn.mobile.ant.design/index-cn)的[umi](https://umijs.org/)插件。

_了解如何使用[umi](https://umijs.org/)开发 RN 应用，请移步至：_<a href="https://github.com/xuyuanxiang/umi-react-native#readme" target="_blank">umi-react-native</a>

## 安装

在 RN 工程目录下，使用 yarn 安装**umi-plugin-antd-react-native**：

```npm
yarn add umi-plugin-antd-react-native --dev
```

在 RN 工程目录下，使用 yarn 安装`@ant-design/react-native@3.x`:

```npm
yarn add @ant-design/react-native
```

**链接 @ant-design/react-native 字体图标资源文件：**

```npm
yarn react-native link
# 等价于: ./node_modules/.bin/react-native link
```

如需使用`@ant-design/react-native@4.x`请按照：[安装 & 使用](https://github.com/ant-design/ant-design-mobile-rn/blob/master/README.zh-CN.md#%E5%AE%89%E8%A3%85--%E4%BD%BF%E7%94%A8)操作。

## 使用

**umi-plugin-antd-react-native**已经为 @ant-design/react-native 做了[**按需加载**](https://rn.mobile.ant.design/docs/react/introduce-cn#%E6%8C%89%E9%9C%80%E5%8A%A0%E8%BD%BD)（[babel-plugin-import](https://github.com/ant-design/babel-plugin-import)）的配置。

如果使用 @ant-design/react-native 组件时，出现错误信息：`Unrecognized font family 'antoutline'`

[ant-design/ant-design-mobile-rn#issue-194](https://github.com/ant-design/ant-design-mobile-rn/issues/194)中有解决方案，需要重新链接字体图标。

### 自定义主题/皮肤

目前已经支持：使用 umi [theme 配置](https://umijs.org/config#theme)覆盖 @ant-design/react-native 的[主题](https://github.com/ant-design/ant-design-mobile-rn/blob/master/components/style/themes/default.tsx)：

```javascript
// .umirc.js
export default {
  theme: {
    color_text_base: '#000000',
    modal_zindex: 999,
    // ...
  },
};
```

> TODO:
>
> 1. 支持在运行时动态切换`@ant-design/react-native`主题/皮肤。

### 国际化支持

> TODO:
>
> 1. 支持通过 umi 配置修改`@ant-design/react-native`初始默认的语言文件；
> 2. 支持在运行时动态切换`@ant-design/react-native`语言文件；
> 3. 支持添加新的`@ant-design/react-native`语言文件。
