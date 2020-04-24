import { IApi } from 'umi';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import { EOL } from 'os';
import { assertExists } from '../../utils';

export default (api: IApi) => {
  const {
    utils: { semver, winPath },
    paths: { absNodeModulesPath = '', cwd = '' },
  } = api;

  const RN_PATH = join(absNodeModulesPath, 'react-native');
  assertExists(RN_PATH);

  const { version: rnVersion } = require(join(RN_PATH, 'package.json'));
  const { major, minor, patch, prerelease, build } = semver.parse(rnVersion) || {};

  let appKey;
  try {
    const appJson = JSON.parse(readFileSync(join(cwd, 'app.json'), 'utf8'));
    appKey = appJson.name;
  } catch (ignored) {}

  api.describe({
    key: 'reactNative',
    config: {
      default: { appKey, version: { raw: rnVersion, major, minor, patch, prerelease, build } },
      schema(joi) {
        return joi
          .object({
            appKey: joi.string().required(),
            version: joi.object({
              raw: joi.string().required(),
              major: joi.number().required(),
              minor: joi.number().required(),
              patch: joi.number().required(),
              build: joi.string().optional(),
              prerelease: [joi.string().optional(), joi.number().optional()],
            }),
          })
          .optional();
      },
    },
  });

  api.chainWebpack((memo) => {
    memo.resolve.alias
      .set('react-native', winPath(RN_PATH))
      .set('react-router-config', winPath(dirname(require.resolve('react-router-config/package.json'))))
      .set('react-router-native', winPath(dirname(require.resolve('react-router-native/package.json'))));
    return memo;
  });

  // 启动时，检查appKey
  api.onStart(() => {
    if (!api.config?.reactNative?.version?.minor || api.config?.reactNative?.version?.minor < 59) {
      throw new TypeError('"umi-preset-react-native" 只支持 react-native 0.59.0 及以上版本。');
    }
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
