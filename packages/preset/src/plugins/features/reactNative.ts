import { IApi } from '@umijs/types';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import { EOL } from 'os';
import { assertExists } from '../../utils';

export default (api: IApi) => {
  const {
    pkg,
    utils: { winPath, resolve },
    paths: { absNodeModulesPath = '', absSrcPath = '', cwd },
  } = api;

  function getUserLibDir({ library }: { library: string }) {
    if ((pkg.dependencies && pkg.dependencies[library]) || (pkg.devDependencies && pkg.devDependencies[library])) {
      return winPath(
        // 通过 resolve 往上找，可支持 lerna 仓库
        // lerna 仓库如果用 yarn workspace 的依赖不一定在 node_modules，可能被提到根目录，并且没有 link
        dirname(
          resolve.sync(`${library}/package.json`, {
            basedir: cwd,
          }),
        ),
      );
    }
    return null;
  }

  const REACT_NATIVE_PATH = getUserLibDir({ library: 'react-native' }) || join(absNodeModulesPath, 'react-native');
  assertExists(REACT_NATIVE_PATH);
  const { version } = require(join(REACT_NATIVE_PATH, 'package.json'));
  const Libraries = [
    {
      name: 'react-router',
      path: 'react-router',
    },
    {
      name: 'react-router-config',
      path: 'react-router-config',
    },
    {
      name: 'react-router-dom', // hack for plugin-dva
      path: 'react-router-native',
    },
    {
      name: 'react-router-native',
      path: 'react-router-native',
    },
    {
      name: '@umijs/runtime',
      path: '@umijs/runtime',
    },
    {
      name: 'history',
      path: 'history-with-query',
    },
  ];

  let appKey;
  try {
    const appJson = JSON.parse(readFileSync(join(absSrcPath, 'app.json'), 'utf8'));
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
    Libraries.forEach(({ name, path }) => {
      memo.resolve.alias.set(
        name,
        getUserLibDir({ library: path }) || winPath(dirname(require.resolve(join(path, 'package.json')))),
      );
    });
    memo.resolve.alias.set('react-native', REACT_NATIVE_PATH);
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
