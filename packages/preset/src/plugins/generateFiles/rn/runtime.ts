import { IApi } from '@umijs/types';
// import { dirname } from 'path';
import runtimeTpl from './runtimeTpl';

const EXPORTER = 'Link as NativeLink, NativeRouter, BackButton, AndroidBackButton';

export default (api: IApi) => {
  const {
    utils: { Mustache, winPath },
  } = api;

  api.onGenerateFiles(async () => {
    api.writeTmpFile({
      path: 'rn/runtime.ts',
      content: Mustache.render(runtimeTpl, {
        // reactRouterNativePath: winPath(dirname(require.resolve('react-router-native/package.json'))),
        exporter: EXPORTER,
      }),
    });
  });

  api.addUmiExports(() => {
    return {
      specifiers: ['NativeLink', 'NativeRouter', 'BackButton', 'AndroidBackButton'],
      source: `../rn/runtime`,
    };
  });
};
