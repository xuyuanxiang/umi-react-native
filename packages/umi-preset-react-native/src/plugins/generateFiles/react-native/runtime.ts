import { IApi } from 'umi';
import { join } from 'path';

const runtimeTpl = `{{#isExpo}}
import {registerRootComponent} from 'expo';

export function render(clientRender: () => any, args: {hot?: boolean} = {}) {
  registerRootComponent(clientRender);
}

{{/isExpo}}
{{^isExpo}}
import {AppRegistry} from 'react-native';

export function render(clientRender: () => any, args: {hot?: boolean} = {}) {
  AppRegistry.registerComponent('{{{ appKey }}}', () => clientRender);
}

{{/isExpo}}
`;

export default (api: IApi) => {
  api.addRuntimePlugin(() => [join(api.paths.absTmpPath!, 'react-native', 'runtime.ts')]);

  api.onGenerateFiles(() => {
    api.writeTmpFile({
      path: 'react-native/runtime.ts',
      content: api.utils.Mustache.render(runtimeTpl, {
        appKey: api.config?.reactNative?.appKey,
        isExpo: Boolean(api.config.expo),
      }),
    });
  });
};
