import { IApi } from 'umi';
import { join } from 'path';

const runtimeTpl = `import React from 'react';
import {ApplyPluginsType} from 'umi';
import {NavigationContainer, NavigationState} from '@react-navigation/native';
{{#safeAreasSupport}}
import {SafeAreaProvider} from 'react-native-safe-area-context';
import SafeAreaView from 'react-native-safe-area-view';

export function patchRoutes({routes}) {
  for (const route of routes) {
    route.component = (props) =>
      React.createElement(
        SafeAreaView,
        props,
        React.createElement(route.component, props),
      );
  }
}

export function rootContainer(container, {plugin}) {
  function onStateChange(state?: NavigationState): void {
    plugin.applyPlugins({
      key: 'onReactNavigationStateChange',
      type: ApplyPluginsType.event,
      initialValue: state,
      async: true,
    });
  }
  return React.createElement(
    SafeAreaProvider,
    null,
    React.createElement(NavigationContainer, {onStateChange}, container),
  );
}
{{/safeAreasSupport}}

{{^safeAreasSupport}}
export function rootContainer(container, {plugin}) {
  function onStateChange(state?: NavigationState): void {
    plugin.applyPlugins({
      key: 'onReactNavigationStateChange',
      type: ApplyPluginsType.event,
      initialValue: state,
      async: true,
    });
  }
  return React.createElement(NavigationContainer, {onStateChange}, container);
}
{{/safeAreasSupport}}

export function render(clientRender: () => any) {
  const promiseLike = clientRender();
  if (promiseLike && typeof promiseLike.then === 'function') {
    Promise.resolve(promiseLike).catch(err => console.error(err));
  }
}

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
    api.writeTmpFile({
      path: 'react-navigation/runtime.ts',
      content: Mustache.render(runtimeTpl, {
        safeAreasSupport: api.config?.reactNavigation?.safeAreasSupport,
      }),
    });
  });
};
