import { IApi } from 'umi';
import { join } from 'path';

const runtimeTpl = `import React from 'react';
import {Provider} from '@ant-design/react-native';
const props = {{#theme}}{theme: {{{ theme }}}}{{/theme}}{{^theme}}null{{/theme}};

export function rootContainer(container) {
  return React.createElement(
    Provider,
    props,
    container,
  );
}

`;

// const exportsTpl = `
//
// `;

// TODO: i18n locales
export default (api: IApi) => {
  api.modifyBabelPresetOpts((opts) => {
    return {
      ...opts,
      import: (opts.import || []).concat([{ libraryName: '@ant-design/react-native' }]),
    };
  });

  api.addRuntimePlugin(() => [join(api.paths.absTmpPath!, 'antd-react-native', 'runtime.ts')]);

  api.onGenerateFiles(() => {
    api.writeTmpFile({
      path: 'antd-react-native/runtime.ts',
      content: api.utils.Mustache.render(runtimeTpl, {
        theme: JSON.stringify(api.config.theme, null, 2),
      }),
    });
    // api.writeTmpFile({
    //   path: 'antd-react-native/exports.ts',
    //   content: api.utils.Mustache.render(exportsTpl, {
    //     theme:
    //       api.config.theme && typeof api.config.theme === 'object' ? JSON.stringify(api.config.theme, null, 2) : null,
    //   }),
    // });
  });
};
