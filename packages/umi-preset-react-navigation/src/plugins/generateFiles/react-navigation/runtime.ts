import { IApi } from 'umi';
import { join } from 'path';

const runtimeTpl = `import React from 'react';
{{^loading}}import {View, Text} from 'react-native';{{/loading}}
import {ApplyPluginsType, dynamic} from 'umi';
import {NavigationContainer, NavigationState} from '@react-navigation/native';
{{#safeAreasSupport}}
import {SafeAreaProvider} from 'react-native-safe-area-context';
// import SafeAreaView from 'react-native-safe-area-view';

// export function patchRoutes({routes}) {
//   for (const route of routes) {
//     route.component = (props) =>
//       React.createElement(
//         SafeAreaView,
//         props,
//         React.createElement(route.component, props),
//       );
//   }
// }

export function rootContainer(container, {plugin}) {
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
          React.createElement(
            SafeAreaProvider,
            null,
            React.createElement(
              NavigationContainer,
              {
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
              container,
            ),
          );
      },
    }),
  );
}
{{/safeAreasSupport}}
{{^safeAreasSupport}}
export function rootContainer(container, {plugin}) {
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
          React.createElement(
            NavigationContainer,
            {
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
            container,
          );
      },
    }),
  );
}
{{/safeAreasSupport}}

`;

export default (api: IApi) => {
  const {
    utils: { Mustache },
  } = api;

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
      path: 'react-navigation/runtime.ts',
      content: Mustache.render(runtimeTpl, {
        safeAreasSupport: api.config?.reactNavigation?.safeAreasSupport,
        loading:
          typeof dynamicImport === 'object' && typeof dynamicImport.loading === 'string'
            ? `require('${dynamicImport.loading}').default`
            : '',
      }),
    });
  });
};
