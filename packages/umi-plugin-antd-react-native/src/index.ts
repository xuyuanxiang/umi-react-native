import { IApi } from 'umi';
import { join } from 'path';

const runtimeTpl = `import React from 'react';
import {Provider} from '@ant-design/react-native';
{{#isExpo}}
import {dynamic} from 'umi';
import {AppLoading} from 'expo';
import {loadAsync} from 'expo-font';

export function rootContainer(container) {
  return React.createElement(dynamic({
    loading: AppLoading,
    loader: async () => {
      await loadAsync(
        'antoutline',
        // eslint-disable-next-line
        require('@ant-design/icons-react-native/fonts/antoutline.ttf')
      );
      await loadAsync(
        'antfill',
        // eslint-disable-next-line
        require('@ant-design/icons-react-native/fonts/antfill.ttf')
      );
      
      return () => React.createElement(
        Provider,
        {{#theme}}{theme: {{{ theme }}}}{{/theme}}{{^theme}}null{{/theme}},
        container,
      );
    },
  }));
}

{{/isExpo}}
{{^isExpo}}
export function rootContainer(container) {
  return React.createElement(
    Provider,
    {{#theme}}{theme: {{{ theme }}}}{{/theme}}{{^theme}}null{{/theme}},
    container,
  );
}

{{/isExpo}}
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
        isExpo: Boolean(api.config.expo),
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

  api.onStart(() => {
    if (api.config.expo) {
      if (api.pkg.dependencies && api.pkg.dependencies['expo-font']) {
        return;
      }
      if (api.pkg.devDependencies && api.pkg.devDependencies['expo-font']) {
        return;
      }
      api.logger.error(
        '@ant-design/react-native的字体图标资源文件依赖"expo-font"，请执行：`expo install expo-font`将其安装至 RN 工程本地。',
      );
      throw new TypeError('"expo-font" 未安装！');
    }
  });
};
