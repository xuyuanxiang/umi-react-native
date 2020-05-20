import { IApi } from 'umi';
import { join } from 'path';

const runtimeTpl = `import {AppRegistry} from 'react-native';

export function render(clientRender: () => any, args: {hot?: boolean} = {}) {
  AppRegistry.registerComponent('{{{ appKey }}}', () => clientRender);
}

`;

export default (api: IApi) => {
  // expo 不需要使用 AppRegistry
  api.addRuntimePlugin(() => (api.config.expo ? [] : [join(api.paths.absTmpPath!, 'react-native', 'runtime.ts')]));

  // expo 不需要使用 AppRegistry
  api.onGenerateFiles(() => {
    if (!api.config.expo) {
      api.writeTmpFile({
        path: 'react-native/runtime.ts',
        content: api.utils.Mustache.render(runtimeTpl, {
          appKey: api.config?.reactNative?.appKey,
        }),
      });
    }
  });
};
