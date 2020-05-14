import { IApi } from 'umi';
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

  // 获取 @umijs/runtime/dist/index.esm.js 的绝对路径
  function getUMIRuntimePath(): string {
    try {
      // 用户工程 node_modules中的 @umijs/runtime
      return resolve.sync('@umijs/runtime/dist/index.esm.js', { basedir: absSrcPath });
    } catch (ignored) {}
    try {
      // @umijs/preset-build-in/node_modules 中的 @umijs/runtime
      return resolve.sync('@umijs/runtime/dist/index.esm.js', {
        basedir: dirname(resolve.sync('@umijs/preset-built-in/package.json', { basedir: absSrcPath })),
      });
    } catch (ignored) {}
    try {
      // @umijs/preset-build-in/node_modules 中的 @umijs/runtime
      return resolve.sync('@umijs/runtime/dist/index.esm.js', {
        basedir: dirname(resolve.sync('@umijs/preset-built-in/package.json', { basedir: process.env.UMI_DIR })),
      });
    } catch (ignored) {}
    try {
      // umi/node_modules 中的 @umijs/runtime
      return resolve.sync('@umijs/runtime/dist/index.esm.js', { basedir: process.env.UMI_DIR });
    } catch (ignored) {}
    // 以上都没有，才使用 umi-runtime-react-native/node_modules 中的 @umijs/runtime
    return require.resolve('@umijs/runtime/dist/index.esm.js');
  }

  function getAllUMIRuntimeAbsPaths(): string[] {
    const results: string[] = ['@umijs/runtime'];

    try {
      // <userProjectRootDir>/node_modules/@umijs/runtime
      results.push(
        dirname(
          resolve.sync('@umijs/runtime/package.json', {
            basedir: absSrcPath,
          }),
        ),
      );
    } catch (ignored) {}

    try {
      // <userProjectRootDir>/node_modules/@umijs/preset-built-in/node_modules/@umijs/runtime
      results.push(
        dirname(
          resolve.sync('@umijs/runtime/package.json', {
            basedir: dirname(resolve.sync('@umijs/preset-built-in/package.json', { basedir: absSrcPath })),
          }),
        ),
      );
    } catch (ignored) {}

    try {
      // <umiDir>/node_modules/@umijs/preset-built-in/node_modules/@umijs/runtime
      results.push(
        dirname(
          resolve.sync('@umijs/runtime/package.json', {
            basedir: dirname(resolve.sync('@umijs/preset-built-in/package.json', { basedir: process.env.UMI_DIR })),
          }),
        ),
      );
    } catch (ignored) {}

    try {
      // <umiDir>/node_modules/@umijs/runtime
      results.push(dirname(resolve.sync('@umijs/runtime/package.json', { basedir: process.env.UMI_DIR })));
    } catch (ignored) {}

    return results;
  }

  /**
   * haul mainFields 写死了：['react-native', 'browser', 'main']
   * 所以 没法使用 treeShaking，因为 treeShaking 需要 mainFields: 'module'。
   * 在 RN 中大多加载的 CommonJS 格式的代码。
   * 专供 RN 的包，比如：react-router-native 的 package.json 文件中，通常都会提供："react-native"或"browser"字段。
   */
  api.addProjectFirstLibraries(() => {
    return [
      { name: 'react-native', path: winPath(REACT_NATIVE_PATH) },
      {
        name: 'react-router-dom',
        path: 'react-router-native',
      },
      { name: 'react-router-native', path: winPath(dirname(require.resolve('react-router-native/package.json'))) },
    ];
    // return [
    //   { name: 'react-native', path: winPath(REACT_NATIVE_PATH) },
    //   {
    //     name: 'react-router-dom',
    //     path: 'react-router-native',
    //   },
    //   { name: 'react-router-native', path: winPath(dirname(require.resolve('react-router-native/package.json'))) },
    //   /**
    //    * umi-runtime-react-native 包中会引用 @umi/runtime。
    //    *
    //    * 但后面需要把 @umi/runtime 替换为 umi-runtime-react-native，为了避免二者"循环引用"。
    //    *
    //    * 故 umi-runtime-react-native 直接引用 @umi/runtime ESModule 格式的代码。
    //    *
    //    * 后面将 @umi/runtime CommonJS 格式的代码 通过 alias 替换为： umi-runtime-react-native
    //    */
    //   {
    //     name: '@umijs/runtime/dist/index.esm.js',
    //     path: winPath(getUMIRuntimePath()),
    //   },
    //   {
    //     name: 'umi-runtime-react-native',
    //     path: winPath(dirname(require.resolve('umi-runtime-react-native/package.json'))),
    //   },
    // ].concat(getAllUMIRuntimeAbsPaths().map((dir) => ({ name: winPath(dir), path: 'umi-runtime-react-native' })));
  });

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

    // metro 0.56.0 以下版本有重大 bug：https://github.com/facebook/react-native/issues/26958
    if (semver.valid(metroVersion) && semver.lt(metroVersion, '0.56.0')) {
      api.logger.error(
        `当前使用的 metro 版本存在 bug: https://github.com/facebook/react-native/issues/26958${EOL}请升级 metro 至 0.56.0及以上版本。`,
      );
    }

    // 检查 RN 版本是否符合 haul 的要求
    if (
      semver.valid(api.config?.reactNative?.version) &&
      semver.gte(api.config.reactNative.version, '0.59.0') &&
      semver.lt(api.config.reactNative.version, '1.0.0')
    ) {
      return;
    }

    throw new TypeError(`"${name}" 只支持 react-native："0.59.0及以上（>= 0.59.0）" 和 "1.0.0以下（< 1.0.0）" 版本。`);
  });
};
