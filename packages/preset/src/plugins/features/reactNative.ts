import { IApi } from '@umijs/types';
import { join } from 'path';
import { readFileSync } from 'fs';
import { EOL } from 'os';

export default (api: IApi) => {
  let appKey;
  try {
    const appJson = JSON.parse(readFileSync(join(api.paths.cwd || process.cwd(), 'app.json'), 'utf8'));
    appKey = appJson.name;
  } catch (ignored) {}

  api.describe({
    key: 'reactNative',
    config: {
      default: { appKey },
      schema(joi) {
        return joi
          .object({
            appKey: joi.string().required(),
          })
          .optional();
      },
    },
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
