import { IApi } from '@umijs/types';
import { join } from 'path';

const runtimeTpl = `import {AppRegistry} from 'react-native';

export function render(clientRender: () => any, args: {hot?: boolean} = {}) {
  AppRegistry.registerComponent('{{{ appKey }}}', () => clientRender);
}

`;

export default (api: IApi) => {
  api.onGenerateFiles(() => {
    // 用户配了 mountElementId 就不再启动 RN 应用
    if (api.config.mountElementId) return;
    api.addRuntimePlugin(() => [join(api.paths.absTmpPath!, 'react-native', 'runtime.ts')]);
    api.writeTmpFile({
      path: 'react-native/runtime.ts',
      content: api.utils.Mustache.render(runtimeTpl, {
        appKey: api.config?.reactNative?.appKey,
      }),
    });
  });
};
