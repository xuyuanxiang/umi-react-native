## 目录

- [目前支持的 umi 配置项](#%E7%9B%AE%E5%89%8D%E6%94%AF%E6%8C%81%E7%9A%84-umi-%E9%85%8D%E7%BD%AE%E9%A1%B9)
- [umi-preset-react-native 扩展配置](#umi-preset-react-native-%E6%89%A9%E5%B1%95%E9%85%8D%E7%BD%AE)
  - [Babel 配置](#babel-%E9%85%8D%E7%BD%AE)
  - [Metro 配置](#metro-%E9%85%8D%E7%BD%AE)

## 配置

> All dependencies start with @umijs/preset-、@umijs/plugin-、umi-preset-、umi-plugin- will be registered as plugin/plugin-preset.

_umi 3.x 后会自动探测、装配插件。所以不需要在`.umirc.js`中配置[plugins](https://umijs.org/config#plugins)和[presets](https://umijs.org/config#presets)。_

**在 RN 中集成其他[umi](https://umijs.org/)插件需要开发者自行斟酌。**

[umi](https://umijs.org/)插件包括：

- 内建插件：[@umijs/preset-built-in](https://github.com/umijs/umi/tree/master/packages/preset-built-in)，这一部分是无法拆除的。
- 额外扩展插件：[@umijs/plugins](https://github.com/umijs/plugins)

_与 DOM 无关的[umi](https://umijs.org/)插件都是可以使用的，或者说支持服务端渲染的插件基本也是可以在 RN 运行环境中使用的。_

### 目前支持的 umi 配置项

目前支持的 umi 配置如下（已满足集成一些常用[umi 插件](https://github.com/umijs/plugins)的需要）：

- [x] [alias](https://umijs.org/config#alias)
- [x] [extraBabelPlugins](https://umijs.org/config#extrababelplugins)
- [x] [extraBabelPresets](https://umijs.org/config#extrababelpresets)
- [x] [history](https://umijs.org/config#history)：只能使用：`{ type: 'memory' }`
- [ ] [mock](https://umijs.org/config#mock)：开发中...
- [x] [outputPath](https://umijs.org/config#outputpath)
- [x] [plugins](https://umijs.org/config#plugins)
- [x] [presets](https://umijs.org/config#presets)
- [ ] [proxy](https://umijs.org/config#proxy)：开发中...
- [x] [routes](https://umijs.org/config#routes)
- [x] [singular](https://umijs.org/config#singular)
- [x] [theme](https://umijs.org/config#theme)：集成 [umi-plugin-antd-react-native](/packages/umi-plugin-antd-react-native)后，可覆盖 @ant-design/react-native 的[主题](https://github.com/ant-design/ant-design-mobile-rn/blob/master/components/style/themes/default.tsx)

_上文未列出的[umi 配置](https://umijs.org/config)对 **umi-preset-react-native** 不生效。_

### umi-preset-react-native 扩展配置

**umi-preset-react-native**会探测用户工程内的依赖，自动为下列开发工具生成所需的**配置文件**和**入口文件**。

- [React Native CLI](https://github.com/react-native-community/cli/blob/master/docs/commands.md#commands)
- [expo](https://expo.io/)

推荐在`.gitignore`文件末尾，追加以下内容：

```text
# umi-react-native
tmp
index.js
metro.config.js
babel.config.js

```

如果你的 RN 工程只使用一种开发工具则无需任何配置。

如果你的 RN 工程安装了多种开发工具，则**必须**通过 umi 配置指定当前使用哪一个：

使用[expo](https://expo.io/)：

```javascript
// .umirc.js
export default {
  expo: true,
};
```

使用[React Native CLI](https://github.com/react-native-community/cli/blob/master/docs/commands.md#commands):

```javascript
// .umirc.js
export default {
  expo: false,
};
```

#### Babel 配置

使用[extraBabelPlugins](https://umijs.org/config#extrababelplugins)和[extraBabelPresets](https://umijs.org/config#extrababelpresets)添加额外的 Babel 配置。

#### Metro 配置

添加额外的[Metro 配置](https://facebook.github.io/metro/docs/configuration)需要使用环境变量：[UMI_ENV](https://umijs.org/docs/env-variables#umi_env)指定要加载的配置文件：`metro.${UMI_ENV}.config.js`。

比如，执行`UMI_ENV=dev umi g rn`时，会加载`metro.dev.config.js`文件中的配置，使用[mergeConfig](https://facebook.github.io/metro/docs/configuration#merging-configurations)同`metro.config.js`中的配置进行合并。
