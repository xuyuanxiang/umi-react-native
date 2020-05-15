import { IApi } from 'umi';
import { dirname, join } from 'path';
import runtimeTpl from './runtimeTpl';

export default (api: IApi) => {
  const {
    utils: { Mustache, winPath },
  } = api;

  api.addEntryImportsAhead(() => [
    {
      source: 'react-native-gesture-handler',
    },
  ]);
  api.addEntryImports(() => [
    {
      specifier: '{enableScreens}',
      source: 'react-native-screens',
    },
  ]);
  api.addEntryCodeAhead(() => `enableScreens();`);

  api.addRuntimePluginKey(() => [
    'onReactNavigationStateChange',
    'getReactNavigationInitialState',
    'getReactNavigationInitialIndicator',
  ]);

  api.addRuntimePlugin(() => [join(api.paths.absTmpPath || '', 'react-navigation', 'runtime')]);

  api.onGenerateFiles(() => {
    const dynamicImport = api.config.dynamicImport;
    api.writeTmpFile({
      path: 'react-navigation/runtime.tsx',
      content: Mustache.render(runtimeTpl, {
        rendererPath: winPath(dirname(require.resolve('umi-renderer-react-navigation/package.json'))),
        reactNavigationPath: winPath(dirname(require.resolve('@react-navigation/native/package.json'))),
        loading:
          typeof dynamicImport === 'object' && typeof dynamicImport.loading === 'string'
            ? `require('${dynamicImport.loading}').default`
            : '',
        theme: JSON.stringify(api.config?.reactNavigation?.theme || {}, null, 2),
        enableTitle: api.config.title !== false,
        defaultTitle: api.config.title || '',
      }),
    });
  });
};
