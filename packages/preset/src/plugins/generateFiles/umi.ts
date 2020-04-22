import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { EOL } from 'os';
import { IApi } from '@umijs/types';
import { winPath } from '@umijs/utils';
import assert from 'umi-react-native-cli/lib/utils/assert';

export function importsToStr(imports: { source: string; specifier?: string }[]) {
  return imports.map((imp) => {
    const { source, specifier } = imp;
    if (specifier) {
      return `import ${specifier} from '${winPath(source)}';`;
    } else {
      return `import '${winPath(source)}';`;
    }
  });
}

export default function (api: IApi) {
  const {
    utils: { Mustache },
  } = api;

  api.onGenerateFiles(async (args) => {
    const umiTpl = readFileSync(join(__dirname, 'umi.tpl'), 'utf-8');
    const rendererPath = await api.applyPlugins({
      key: 'modifyRendererPath',
      type: api.ApplyPluginsType.modify,
      initialValue: require.resolve('@umijs/renderer-react'),
    });
    let appKey = api.config.appKey;
    if (!appKey) {
      const appJsonFilename = join(api.paths.cwd || process.cwd(), 'app.json');
      if (!existsSync(appJsonFilename)) {
        throw new Error(`${appJsonFilename} was not exists.`);
      }
      try {
        const appJson = JSON.parse(readFileSync(appJsonFilename, 'utf8'));
        appKey = appJson.name;
      } catch (ignored) {}
    }
    if (!appKey) {
      throw new TypeError(
        `"appKey" 未配置。${EOL}1. 请在UMI配置文件（比如：.umirc.js）中添加"appKey"字段，并设置一个值；${EOL}2. 或者在工程根目录下的 app.json 文件中设置"name"字段和值。${EOL}小贴士:${EOL}"appKey"即RN JS代码域中: "AppRegistry.registerComponent(appKey, componentProvider);"的第一个参数；也是iOS/Android原生代码中加载bundle时所需的"moduleName"，其值通常是使用 react-native 命令行工具初始化新建RN工程时指定的项目名称。`,
      );
    }
    api.writeTmpFile({
      path: 'umi.ts',
      content: Mustache.render(umiTpl, {
        appKey,
        rendererPath: winPath(rendererPath),
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
}
