import { IApi } from '@umijs/types';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import { EOL } from 'os';
import { assertExists } from '../../utils';

export default (api: IApi) => {
  const {
    utils: { winPath, resolve },
    paths: { absNodeModulesPath = '', absSrcPath = '', absTmpPath },
  } = api;

  function getUserLibDir(library: string, dir?: boolean) {
    try {
      if (dir) {
        return dirname(
          resolve.sync(join(library, 'package.json'), {
            basedir: absTmpPath,
          }),
        );
      } else {
        return resolve.sync(library, {
          basedir: absTmpPath,
        });
      }
    } catch (ignored) {}
    return null;
  }

  const REACT_NATIVE_PATH = getUserLibDir('react-native', true) || join(absNodeModulesPath, 'react-native');
  assertExists(REACT_NATIVE_PATH);
  const { version } = require(join(REACT_NATIVE_PATH, 'package.json'));

  let appKey;
  try {
    const appJson = JSON.parse(readFileSync(getUserLibDir('app.json') || join(absSrcPath, 'app.json'), 'utf8'));
    appKey = appJson.name;
  } catch (ignored) {}

  api.describe({
    key: 'reactNative',
    config: {
      default: { appKey, version },
      schema(joi) {
        return joi
          .object({
            appKey: joi.string(),
            version: joi.string(),
          })
          .optional();
      },
    },
  });

  api.chainWebpack((memo) => {
    const reactRouterNativePath = winPath(
      getUserLibDir('react-router-native', true) || dirname(require.resolve('react-router-native/package.json')),
    );
    memo.resolve.alias
      .set(
        'history',
        winPath(
          getUserLibDir('history-with-query/esm/history.js') || require.resolve('history-with-query/esm/history.js'),
        ),
      )
      .set(
        'react-router',
        winPath(
          getUserLibDir('react-router/esm/react-router.js') || require.resolve('react-router/esm/react-router.js'),
        ),
      )
      .set('react-router-dom', reactRouterNativePath) // hack for dva
      .set('react-router-native', reactRouterNativePath)
      .set(
        'react-router-config',
        winPath(
          getUserLibDir('react-router-config/esm/react-router-config.js') ||
            require.resolve('react-router-config/esm/react-router-config.js'),
        ),
      )
      .set(
        '@umijs/runtime',
        winPath(
          getUserLibDir('@umijs/runtime/dist/index.esm.js') ||
            resolve.sync('@umijs/runtime/dist/index.esm.js', { basedir: process.env.UMI_DIR }),
        ),
      );
    return memo;
  });

  // 启动时，检查appKey
  api.onStart(() => {
    if (!api.config?.reactNative?.appKey) {
      api.logger
        .error(`"reactNative.appKey" 未配置！${EOL}1. 请在工程根目录下的 app.json 文件中为"name"字段指定一个值，作为"appKey"；${EOL}2. 也可以在 umi 配置文件（比如：.umirc.js）中设置：${EOL}export default {
  reactNative: {
     appKey: '将这里替换为你的值',
  },
};。${EOL}小贴士：${EOL}  "appKey" 即 RN JS 代码域中: "AppRegistry.registerComponent(appKey, componentProvider);"的第一个参数，也是 iOS/Android 原生代码中加载 bundle 时所需的 "moduleName"；${EOL}  其值是使用 react-native 命令行工具初始化新建 RN 工程时所指定的项目名称，存储在工程根目录下 app.json 文件的 "name" 字段中。`);
      throw new TypeError('"react-native.appKey" 未配置');
    }
  });
};
