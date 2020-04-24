import { IApi } from 'umi';
import { dirname } from 'path';
import indexTpl from './indexTpl';

export default (api: IApi) => {
  const {
    utils: { Mustache, winPath },
  } = api;

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

  api.onGenerateFiles(async () => {
    api.writeTmpFile({
      path: 'index.ts',
      content: Mustache.render(indexTpl, {
        appKey: api.config?.reactNative?.appKey,
        runtimePath: winPath(dirname(require.resolve('@umijs/runtime/package.json'))),
        entryCodeAhead: (
          await api.applyPlugins({
            key: 'addEntryCodeAhead',
            type: api.ApplyPluginsType.add,
            initialValue: [],
          })
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
