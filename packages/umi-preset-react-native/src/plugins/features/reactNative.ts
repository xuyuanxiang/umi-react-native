import { IApi } from 'umi';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import { EOL } from 'os';
import { assertExists } from '../../utils';

export default (api: IApi) => {
  const {
    utils: { resolve, lodash, winPath },
    paths: { absNodeModulesPath = '', absSrcPath = '', absTmpPath },
  } = api;

  /**
   * 优先读取用户目录下依赖的绝对路径
   * @param library 比如：'react-native'（目录） 或者 'react-router/esm/index.js'（文件）
   * @param defaults library找不到时的缺省值
   * @param dir true-返回目录绝对路径，false-返回文件绝对路径
   * @param basedir 用户目录查找起始路径
   */
  function getUserLibDir(library: string, defaults: string, dir: boolean = false, basedir = absSrcPath): string {
    try {
      const path = resolve.sync(library, {
        basedir,
      });
      if (dir) {
        return dirname(path);
      } else {
        return path;
      }
    } catch (ignored) {}
    return defaults;
  }

  const REACT_NATIVE_PATH = getUserLibDir(
    join('react-native', 'package.json'),
    join(absNodeModulesPath, 'react-native'),
    true,
  );

  assertExists(REACT_NATIVE_PATH);

  const { version } = require(join(REACT_NATIVE_PATH, 'package.json'));

  let appKey;
  try {
    const appJson = JSON.parse(
      readFileSync(getUserLibDir('app.json', join(absSrcPath, 'app.json'), false, absSrcPath), 'utf8'),
    );
    appKey = appJson.name;
  } catch (ignored) {}

  // umi-preset-react-native 扩展配置
  api.describe({
    key: 'reactNative',
    config: {
      default: { appKey, version },
      schema(joi) {
        return joi
          .object({
            appKey: joi.string(), // moduleName  app.json#name
            version: joi.string(), // RN 版本号
          })
          .optional();
      },
    },
  });

  // 修改 umi 默认值，避免进到 umi 调用 DOM/BOM API 的代码分支，导致 RN 运行报错。
  // 对于.umircjs 中的用户值，在启动时校验，如果不满足 RN 预期，则给予错误提示，让用户有感知。
  api.modifyDefaultConfig((config) => {
    // mountElementId 如果有值，会进到 @umijs/renderer-react 调用 react-dom 的 if 代码分支，在 RN 中会报错。
    config.mountElementId = '';

    // 'browser' 和 'hash' 类型的 history 需要 DOM，在 RN 中运行会报错。
    config.history = lodash.defaultsDeep(
      {
        type: 'memory',
      },
      config.history,
    );

    return config;
  });

  api.addProjectFirstLibraries(() => [
    { name: 'react-native', path: winPath(REACT_NATIVE_PATH) },
    {
      name: 'react-router-dom',
      path: 'react-router-native',
    },
    {
      name: 'react-router-native',
      path: getUserLibDir(
        'react-router-native',
        winPath(dirname(require.resolve('react-router-native/package.json'))),
        true,
      ),
    },
  ]);

  // 启动时检查
  api.onStart(() => {
    // appKey 一定不能为空，否则 RN 引用没法注册/部署/启动。
    if (!api.config?.reactNative?.appKey) {
      api.logger
        .error(`"reactNative.appKey" 未配置！${EOL}1. 请在工程根目录下的 app.json 文件中为"name"字段指定一个值，作为"appKey"；${EOL}2. 也可以在 umi 配置文件（比如：.umirc.js）中设置：${EOL}export default {
  reactNative: {
     appKey: '将这里替换为你的值',
  },
};。${EOL}小贴士：${EOL}  "appKey" 即 RN JS 代码域中: "AppRegistry.registerComponent(appKey, componentProvider);"的第一个参数，也是 iOS/Android 原生代码中加载 bundle 时所需的 "moduleName"；${EOL}  其值是使用 react-native 命令行工具初始化新建 RN 工程时所指定的项目名称，存储在工程根目录下 app.json 文件的 "name" 字段中。`);
      throw new TypeError('"react-native.appKey" 未配置');
    }

    // mountElementId 必须为空字符串，false也不行。
    if (api.config.mountElementId !== '') {
      api.logger.error(
        `在 RN 环境中"mountElementId"只能设置为空字符串！${EOL}因为设置为其他值时，umi 会调用 react-dom 的 API，在 RN 中运行会报错！`,
      );
      throw new TypeError('"mountElementId" 配置错误');
    }

    // RN 中 history 只能使用 memory 类型
    if (api.config.history && api.config.history.type !== 'memory') {
      api.logger.error(
        `在 RN 环境中，"history"只能设置为："memory"类型！${EOL}因为 "browser"和"hash"类型需要 DOM，在 RN 中运行会报错！`,
      );
      throw new TypeError('"history.type" 配置错误');
    }

    if (api.config.dynamicImport && !api.config.dynamicImport.loading) {
      api.logger.error(
        `在 RN 环境中启用"dynamicImport"功能时，必须实现自定义的"loading"！${EOL}因为 umi 默认 loading 使用了 HTML 标签，在 RN 中运行会报错！${EOL}查看如何配置自定义 loading：https://umijs.org/config#dynamicimport`,
      );
      throw new TypeError('"dynamicImport.loading" 未配置');
    }
  });
};
