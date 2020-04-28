import { existsSync, symlinkSync } from 'fs';
import { join } from 'path';
import { platform } from 'os';
import { IApi } from '@umijs/types';
import indexTpl from './indexTpl';

const PLATFORM = platform();

export default (api: IApi) => {
  const {
    utils: { Mustache, winPath },
    paths: { absTmpPath, absNodeModulesPath },
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
      path: 'index.js',
      content: Mustache.render(indexTpl, {
        appKey: api.config?.reactNative?.appKey,
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
    // const link = join(absTmpPath || '', 'node_modules');
    // if (!existsSync(link)) {
    //   symlinkSync(absNodeModulesPath || '', link, PLATFORM === 'win32' ? 'junction' : 'dir');
    // }
  });
};
