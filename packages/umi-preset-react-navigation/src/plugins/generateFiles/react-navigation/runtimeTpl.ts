export default `import React from 'react';
{{^loading}}import {View, Text} from 'react-native';{{/loading}}
import {ApplyPluginsType, dynamic} from 'umi';
import {Navigation} from '{{{ rendererPath }}}';
import {NavigationContainer} from '{{{ reactNavigationPath }}}';

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
          React.createElement(
            NavigationContainer,
            {
              theme: {{{ theme }}},
              initialState,
              onStateChange: (state: any): void => {
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
              plugin,
              {{#enableTitle}}
              defaultTitle: '{{{ defaultTitle }}}',
              {{/enableTitle}}
            }),
          );
      },
    }),
  );
}

`;
