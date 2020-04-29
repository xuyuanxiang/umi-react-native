import { IApi } from '@umijs/types';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import { EOL } from 'os';
import { assertExists } from '../../utils';
import { name } from '../../../package.json';

export default (api: IApi) => {
  const {
    utils: { resolve, semver, lodash },
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
  assertExists(REACT_NATIVE_PATH);
  const { version } = require(join(REACT_NATIVE_PATH, 'package.json'));

  let appKey;
  try {
    const appJson = JSON.parse(
      readFileSync(getUserLibDir('app.json', join(absSrcPath, 'app.json'), false, absSrcPath), 'utf8'),
    );
    appKey = appJson.name;
  } catch (ignored) {}

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

  api.modifyConfig((config) => {
    config.mountElementId = '';
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
    { name: 'react-router', path: require.resolve('react-router/esm/react-router.js') },
    { name: 'react-router-native', path: dirname(require.resolve('react-router-native/package.json')) },
    // @umijs/plugin-dva或许还有其他插件中会引用`react-router-dom`这里通过alias 将其改为引用 `react-router-native`
    { name: 'react-router-dom', path: dirname(require.resolve('react-router-native/package.json')) },
    { name: 'history', path: require.resolve('history-with-query/esm/history.js') },
  ]);

  /**
   * `@umijs/preset-built-in`生成的临时文件中会将`@umijs/runtime`转换为绝对路径。
   * 这里添加 alias 将`@umijs/runtime`的绝对路径映射为：`umi-react-native-runtime`。
   */
  function detectUmiRuntimeDirs(): string[] {
    const results: string[] = [];
    let baseDir;
    try {
      baseDir = dirname(resolve.sync('@umijs/preset-built-in/package.json', { basedir: process.env.UMI_DIR }));
      results.push(dirname(resolve.sync('@umijs/runtime/package.json', { basedir: baseDir })));
    } catch (ignored) {}
    try {
      results.push(dirname(resolve.sync('@umijs/runtime/package.json', { basedir: process.env.UMI_DIR })));
    } catch (ignored) {}
    return results;
  }
  api.chainWebpack((memo) => {
    const umiRuntimeDirs = detectUmiRuntimeDirs();
    umiRuntimeDirs.forEach((dir) => {
      memo.resolve.alias.set(dir, 'umi-react-native-runtime');
    });
    return memo;
  });

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
};
