import { IApi } from 'umi';
import { dirname } from 'path';

export default (api: IApi) => {
  const {
    utils: { resolve, winPath },
    paths,
  } = api;
  api.describe({
    key: 'reactNavigation',
    config: {
      default: {
        theme: {
          // 使用 ant-design 默认配色作为 Navigation 的默认主题
          dark: false,
          colors: {
            primary: '#108ee9',
            background: '#ffffff',
            card: '#ffffff',
            text: '#000000',
            border: '#dddddd',
          },
        },
      },
      schema(joi) {
        return joi
          .object({
            theme: joi
              .object({
                dark: joi.boolean().required(),
                colors: joi.object({
                  primary: joi.string().required(),
                  background: joi.string().required(),
                  card: joi.string().required(),
                  text: joi.string().required(),
                  border: joi.string().required(),
                }),
              })
              .optional(),
          })
          .optional();
      },
    },
  });

  /**
   * 这些依赖包含原生代码，必须安装到用户工程本地，不能由插件内置。
   * 原因：
   *  1. 似乎在用户工程 package.json 的 dependencies 字段中，RN 0.60.x 的自动链接才能生效；
   *  2. 比如如果存在两份 react-native-screens，会重复注册 Native Module，导致运行错误。
   */
  const libs = [
    '@react-native-community/masked-view',
    'react-native-gesture-handler',
    'react-native-reanimated',
    'react-native-safe-area-context',
    'react-native-screens',
    'umi-renderer-react-navigation',
  ];

  /**
   * react-navigation 运行时 需要引入这些依赖
   * 必须将这些依赖库通过 alias 映射到 用户工程 node_modules 下的路径才能加载到
   */
  api.chainWebpack((memo) => {
    libs.forEach((name) => {
      memo.resolve.alias.set(
        name,
        // RN 使用 Haste Module，专门针对 RN 的 依赖库 通常使用 CommonJS Module 的方式都没法获取到入口文件
        winPath(dirname(resolve.sync(`${name}/package.json`, { basedir: paths.absSrcPath }))),
      );
    });
    return memo;
  });
};
