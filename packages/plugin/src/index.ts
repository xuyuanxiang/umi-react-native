import { IApi } from '@umijs/types';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import { EOL } from 'os';
import entryFileTpl from './entryFileTpl';

export default (api: IApi) => {
  const {
    utils: { Mustache, winPath },
    logger,
  } = api;

  let appKey;
  try {
    const appJson = JSON.parse(readFileSync(join(api.paths.cwd || process.cwd(), 'app.json'), 'utf8'));
    appKey = appJson.name;
  } catch (ignored) {}

  function importsToStr(imports: { source: string; specifier?: string }[]): string[] {
    return imports.map((imp) => {
      const { source, specifier } = imp;
      if (specifier) {
        return `import ${specifier} from '${winPath(source)}';`;
      } else {
        return `import '${winPath(source)}';`;
      }
    });
  }

  // 添加配置项
  api.describe({
    key: 'react-native',
    config: {
      default: { appKey },
      schema(joi) {
        return joi
          .object({
            appKey: joi.string().optional(),
          })
          .optional();
      },
    },
  });

  // 启动时，检查appKey
  api.onStart(() => {
    if (!api.config['react-native']?.appKey) {
      logger.error(`"react-native.appKey" 未配置！${EOL}1. 请在工程根目录下的 app.json 文件中为"name"字段指定一个值，作为"appKey"；${EOL}2. 也可以在 umi 配置文件（比如：.umirc.js）中设置：${EOL}export default {
  'react-native': {
     appKey: '将这里替换为你的值',
  },
};。${EOL}小贴士：${EOL}  "appKey" 即 RN JS 代码域中: "AppRegistry.registerComponent(appKey, componentProvider);"的第一个参数，也是 iOS/Android 原生代码中加载 bundle 时所需的 "moduleName"；${EOL}  其值是使用 react-native 命令行工具初始化新建 RN 工程时所指定的项目名称，存储在工程根目录下 app.json 文件的 "name" 字段中。`);
      throw new TypeError('"react-native.appKey" 未配置');
    }
  });

  // 不修改renderer-react, 保留umi.ts，可能会使用 RN web
  // api.modifyRendererPath(() => require.resolve('umi-renderer-react-native'));
  api.onGenerateFiles(async () => {
    api.writeTmpFile({
      path: 'index.ts',
      content: Mustache.render(entryFileTpl, {
        appKey: api.config['react-native']?.appKey,
        rendererPath: winPath(require.resolve('umi-renderer-react-native')),
        runtimePath: winPath(dirname(require.resolve('@umijs/runtime/package.json'))),
        entryCode: (
          await api.applyPlugins({
            key: 'addEntryCode',
            type: api.ApplyPluginsType.add,
            initialValue: [],
          })
        ).join('\r\n'),
        entryCodeAhead: (
          await api.applyPlugins({
            key: 'addEntryCodeAhead',
            type: api.ApplyPluginsType.add,
            initialValue: [],
          })
        ).join('\r\n'),
        polyfillImports: importsToStr(
          await api.applyPlugins({
            key: 'addPolyfillImports',
            type: api.ApplyPluginsType.add,
            initialValue: [],
          }),
        ).join('\r\n'),
        importsAhead: importsToStr(
          await api.applyPlugins({
            key: 'addEntryImportsAhead',
            type: api.ApplyPluginsType.add,
            initialValue: [],
          }),
        ).join('\r\n'),
        imports: importsToStr(
          await api.applyPlugins({
            key: 'addEntryImports',
            type: api.ApplyPluginsType.add,
            initialValue: [],
          }),
        ).join('\r\n'),
      }),
    });
  });
};
