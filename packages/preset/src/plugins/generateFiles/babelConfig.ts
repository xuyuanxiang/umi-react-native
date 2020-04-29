import { IApi } from '@umijs/types';
import { getBabelPresetOpts, getBabelOpts } from '@umijs/bundler-utils';
import { dirname } from 'path';

const CONTENT = `module.exports = {{{ babelConfig }}};

`;

const METRO_PRESETS_REG = /metro-react-native-babel-preset/;
const UMI_PRESET_REG = /(@umijs\/)?babel-preset-umi/;

interface IImportPluginOpts {
  libraryName: string;
  libraryDirectory?: string;
  style?: boolean;
  camel2DashComponentName?: boolean;
}

export default (api: IApi) => {
  const {
    utils: { winPath, Mustache, lodash },
  } = api;

  api.modifyBabelOpts((opts) => {
    return {
      ...opts,
      presets: [
        // 剔除：@umijs/babel-preset-umi 和 metro-react-native-babel-preset
        ...opts.presets.filter((it) => !METRO_PRESETS_REG.test(it) && !UMI_PRESET_REG.test(it)),
        winPath(dirname(require.resolve('@haul-bundler/babel-preset-react-native/package.json'))),
      ],
    };
  });

  api.onGenerateFiles(async () => {
    const env = api.env === 'production' ? 'production' : 'development';
    let presetOpts = getBabelPresetOpts({
      config: api.config,
      env,
    });
    presetOpts = await api.applyPlugins({
      type: api.ApplyPluginsType.modify,
      key: 'modifyBabelPresetOpts',
      initialValue: presetOpts,
    });
    let babelOpts = getBabelOpts({
      cwd: api.cwd,
      config: api.config,
      presetOpts,
    });
    babelOpts = await api.applyPlugins({
      type: api.ApplyPluginsType.modify,
      key: 'modifyBabelOpts',
      initialValue: babelOpts,
    });
    if (presetOpts.import) {
      /**
       * presetOpts: 即@umijs/babel-preset-umi的配置参数。
       * 目前只有@umijs/plugin-antd用到 import 选项，其他配置赞不支持。避免和haul的babel配置冲突
       */
      const plugins: [string, any, (string | undefined)?][] = presetOpts.import.map((importOpts: IImportPluginOpts) => {
        return [require.resolve('babel-plugin-import'), importOpts, importOpts.libraryName];
      });
      babelOpts.plugins.push(...plugins);
    }
    api.writeTmpFile({
      path: 'babel.config.js',
      content: Mustache.render(CONTENT, {
        babelConfig: JSON.stringify(lodash.pick(babelOpts, ['presets', 'plugins']), null, 2),
      }),
    });
  });
};
