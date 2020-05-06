import { IApi } from '@umijs/types';

const CONTENT = `module.exports = {{{ babelConfig }}};

`;

// const METRO_PRESETS_REG = /metro-react-native-babel-preset/;
// const UMI_PRESET_REG = /(@umijs\/)?babel-preset-umi/;

interface IImportPluginOpts {
  libraryName: string;
  libraryDirectory?: string;
  style?: boolean;
  camel2DashComponentName?: boolean;
}

export default (api: IApi) => {
  const {
    utils: { Mustache, lodash },
  } = api;

  // api.modifyBabelOpts((opts) => {
  //   return {
  //     ...opts,
  //     presets: [
  //       // 剔除：@umijs/babel-preset-umi 和 metro-react-native-babel-preset
  //       ...opts.presets.filter((it) => !METRO_PRESETS_REG.test(it) && !UMI_PRESET_REG.test(it)),
  //       winPath(dirname(require.resolve('@haul-bundler/babel-preset-react-native/package.json'))),
  //     ],
  //   };
  // });

  api.onGenerateFiles(async () => {
    const env = api.env === 'production' ? 'production' : 'development';
    const presetOpts = await api.applyPlugins({
      type: api.ApplyPluginsType.modify,
      key: 'modifyBabelPresetOpts',
      initialValue: {
        nodeEnv: env,
        dynamicImportNode: false,
        autoCSSModules: false,
        svgr: false,
        env: {},
        import: [],
      },
    });
    const plugins: (string | [string, any, string?])[] = [];
    const presets: (string | [string, any, string?])[] = [require.resolve('@haul-bundler/babel-preset-react-native')];

    const extraBabelPlugins = api.config.extraBabelPlugins;
    if (lodash.isArray(extraBabelPlugins)) {
      plugins.push(...extraBabelPlugins);
    } else if (lodash.isString(extraBabelPlugins)) {
      plugins.push(extraBabelPlugins);
    }

    if (presetOpts.import) {
      /**
       * presetOpts: 即@umijs/babel-preset-umi的配置参数。
       * 目前只有@umijs/plugin-antd用到 import 选项，其他配置赞不支持。避免和haul的babel配置冲突
       */
      plugins.push(
        ...presetOpts.import.map((importOpts: IImportPluginOpts) => {
          return [require.resolve('babel-plugin-import'), importOpts, importOpts.libraryName];
        }),
      );
    }

    const extraBabelPresets = api.config.extraBabelPresets;
    if (lodash.isArray(extraBabelPresets)) {
      presets.push(...extraBabelPresets.filter(Boolean));
    } else if (lodash.isString(extraBabelPresets)) {
      presets.push(extraBabelPresets);
    }

    const babelConfig = await api.applyPlugins({
      type: api.ApplyPluginsType.modify,
      key: 'modifyBabelOpts',
      initialValue: {
        presets,
        plugins,
      },
    });

    api.writeTmpFile({
      path: 'babel.config.js',
      content: Mustache.render(CONTENT, {
        babelConfig: JSON.stringify(babelConfig, null, 2),
      }),
    });
  });
};
