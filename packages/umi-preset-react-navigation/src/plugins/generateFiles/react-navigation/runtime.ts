import { IApi } from 'umi';
import { dirname, join } from 'path';
import { dependencies } from '../../../../package.json';

const runtimeTpl = `import React from 'react';
{{^loading}}import {View, Text} from 'react-native';{{/loading}}
import {ApplyPluginsType, dynamic} from 'umi';
import {NavigationContainer, NavigationState} from '@react-navigation/native';
import {Navigation} from 'umi-renderer-react-navigation';
import createNavigator from './createNavigator';
{{#enableSafeAreasSupport}}
import {SafeAreaProvider, SafeAreaView} from './exports';

function SafeAreaViewWrapper({children}) {
  return <SafeAreaView>{children}</SafeAreaView>;
}

export function patchRoutes({routes}) {
  if (Array.isArray(routes)) {
    for (const route of routes) {
      if (route.wrappers) {
        route.wrappers.push(SafeAreaViewWrapper);
      } else {
        route.wrappers = [SafeAreaViewWrapper];
      }
    }
  }
  console.log('patchRoutes:', routes);
}
{{/enableSafeAreasSupport}}

export function rootContainer(container, {plugin, routes, history}) {
  return React.createElement(
    dynamic({
      loading: plugin.applyPlugins({
        key: 'getReactNavigationInitialIndicator',
        type: ApplyPluginsType.modify,
        initialValue: {{#loading}}{{{ loading }}}{{/loading}}{{^loading}}({ error, isLoading }: { error: Error; isLoading: boolean }) => {
          if (__DEV__) {
            if (isLoading) {
              return React.createElement(Text, null, 'Loading...');
            }
            if (error) {
              return React.createElement(View, null, React.createElement(Text, null, error.message), React.createElement(Text, null, error.stack));
            }
          }
          return React.createElement(Text, null, 'Loading...');
        }{{/loading}},
      }),
      loader: async () => {
        const initialState = await plugin.applyPlugins({
          key: 'getReactNavigationInitialState',
          type: ApplyPluginsType.modify,
          async: true,
        });
        return () =>
          {{#enableSafeAreasSupport}}
          React.createElement(
            SafeAreaProvider,
            null,
            React.createElement(
              NavigationContainer,
              {
                theme: {{{ theme }}},
                initialState,
                onStateChange: (state?: NavigationState): void => {
                  plugin.applyPlugins({
                    key: 'onReactNavigationStateChange',
                    type: ApplyPluginsType.event,
                    initialValue: state,
                    async: true,
                  });
                },
              },
              React.createElement(Navigation, {
                routes, 
                history, 
                navigator: createNavigator(), 
                plugin,
                {{#enableTitle}}
                defaultTitle: '{{{ defaultTitle }}}',
                {{/enableTitle}}
              }),
            ),
          );
          {{/enableSafeAreasSupport}}
          {{^enableSafeAreasSupport}}
          React.createElement(
            NavigationContainer,
            {
              theme: {{{ theme }}},
              initialState,
              onStateChange: (state?: NavigationState): void => {
                plugin.applyPlugins({
                  key: 'onReactNavigationStateChange',
                  type: ApplyPluginsType.event,
                  initialValue: state,
                  async: true,
                });
              },
            },
            React.createElement(Navigation, {
              routes, 
              history, 
              navigator: createNavigator(), 
              plugin,
              {{#enableTitle}}
              defaultTitle: '{{{ defaultTitle }}}',
              {{/enableTitle}}
            }),
          );
          {{/enableSafeAreasSupport}}
      },
    }),
  );
}

`;

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
