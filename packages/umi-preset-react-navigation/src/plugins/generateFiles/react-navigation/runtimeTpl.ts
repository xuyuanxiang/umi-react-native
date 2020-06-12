export default `import React from 'react';
import loading from '@@/react-native/loading';
import {ApplyPluginsType, dynamic} from 'umi';
import {NavigationContainer} from '{{{ reactNavigationPath }}}';

export function rootContainer(container, {plugin}) {
  return React.createElement(
    dynamic({
      loading: plugin.applyPlugins({
        key: 'getReactNavigationInitialIndicator',
        type: ApplyPluginsType.modify,
        initialValue: loading,
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
                  args: {state},
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

`;
