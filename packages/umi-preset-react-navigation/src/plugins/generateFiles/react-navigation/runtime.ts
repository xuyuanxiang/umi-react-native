import { IApi } from 'umi';
import { dirname, join } from 'path';
import runtimeTpl from './runtimeTpl';
import { dependencies } from '../../../../package.json';

export default (api: IApi) => {
  const {
    utils: { Mustache, winPath },
  } = api;

  api.addProjectFirstLibraries(() =>
    Object.keys(dependencies).map((name) => ({
      name,
      path: winPath(dirname(require.resolve(`${name}/package.json`))),
    })),
  );
  api.addEntryImportsAhead(() => [{ source: 'react-native-gesture-handler' }]);
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
        enableSafeAreasSupport: Boolean(api.config?.reactNavigation?.enableSafeAreasSupport),
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
