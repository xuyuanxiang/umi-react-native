import { IApi } from '@umijs/types';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import { EOL } from 'os';

import { assertExists } from '../../utils';
import { name } from '../../../package.json';

export default (api: IApi) => {
  const {
    utils: { resolve, semver, lodash, winPath },
    paths: { absNodeModulesPath = '', absSrcPath = '', absTmpPath },
  } = api;

  /**
   * 优先读取用户目录下依赖的绝对路径
   * @param library 比如：'react-native'（目录） 或者 'react-router/esm/index.js'（文件）
   * @param defaults library找不到时的缺省值
   * @param dir true-返回目录绝对路径，false-返回文件绝对路径
   * @param basedir 用户目录查找起始路径
   */
  function getUserLibDir(library: string, defaults: string, dir: boolean = false, basedir = absTmpPath): string {
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
  const METRO_PATH = getUserLibDir(join('metro', 'package.json'), join(absNodeModulesPath, 'metro'), true);

  assertExists(REACT_NATIVE_PATH);
  assertExists(METRO_PATH);

  const { version } = require(join(REACT_NATIVE_PATH, 'package.json'));
  const { metroVersion } = require(join(METRO_PATH, 'package.json'));

  let appKey;
  try {
    const appJson = JSON.parse(
      readFileSync(getUserLibDir('app.json', join(absSrcPath, 'app.json'), false, absSrcPath), 'utf8'),
    );
    appKey = appJson.name;
  } catch (ignored) {}

  // 配置参数
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

  // 修改 umi 默认值（非用户值），避免进到 umi 调用 DOM相关 API的代码分支，导致 RN 运行报错。
  api.modifyDefaultConfig((config) => {
    // mountElementId 不为空时，@umijs/renderer-react 会调用 react-dom 在 RN 中会报错
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

  // haul中没有treeShaking， mainFields 写死了。
  api.addProjectFirstLibraries(() => [
    { name: 'react-native', path: REACT_NATIVE_PATH },
    { name: 'react-router-native', path: dirname(require.resolve('react-router-native/package.json')) },
    // @umijs/plugin-dva或许还有其他插件中会引用`react-router-dom`这里通过alias 将其改为引用 `react-router-native`
    { name: 'react-router-dom', path: dirname(require.resolve('react-router-native/package.json')) },
  ]);

  // 启动时，检查 appKey 和 RN 版本
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
    // 按照RN的期望修改了默认值，但这里在启动时检查用户值
    if (api.config.mountElementId) {
      api.logger.error(
        `在 RN 环境中"mountElementId"只能设置为空字符串！${EOL}因为设置为其他值时，umi 会调用 react-dom 的 API，在 RN 中运行会报错！`,
      );
      throw new TypeError('"mountElementId" 配置错误');
    }
    if (api.config.history && api.config.history.type !== 'memory') {
      api.logger.error(
        `在 RN 环境中，"history"只能设置为："memory"类型！${EOL}因为 "browser"和"hash"类型需要 DOM，在 RN 中运行会报错！`,
      );
      throw new TypeError('"history.type" 配置错误');
    }
    if (api.config.dynamicImport && !api.config.dynamicImport.loading) {
      api.logger.error(
        `在 RN 环境中启用"dynamicImport"功能时，必须实现自定的"loading"！${EOL}因为 umi 默认loading使用了 HTML 标签，在 RN 中运行会报错！`,
      );
      throw new TypeError('"dynamicImport.loading" 未配置');
    }
    if (semver.valid(metroVersion) && semver.lt(metroVersion, '0.56.0')) {
      api.logger.error(
        `当前使用的 metro 版本存在 bug: https://github.com/facebook/react-native/issues/26958${EOL}请升级 metro 至 0.56.0及以上版本。`,
      );
    }
    if (
      semver.valid(api.config?.reactNative?.version) &&
      semver.gte(api.config.reactNative.version, '0.59.0') &&
      semver.lt(api.config.reactNative.version, '1.0.0')
    ) {
      return;
    }
    throw new TypeError(`"${name}" 只支持 react-native："0.59.0及以上（>= 0.59.0）" 和 "1.0.0以下（< 1.0.0）" 版本。`);
  });

  api.addTmpGenerateWatcherPaths(() => ['react-native']);
  api.modifyRendererPath(() => winPath(dirname(require.resolve('umi-renderer-react-native/package.json'))));
};
