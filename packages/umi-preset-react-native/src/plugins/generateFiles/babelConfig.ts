import { IApi } from 'umi';
import { join } from 'path';
import { existsSync } from 'fs';

const CONTENT = `module.exports = {{{ babelConfig }}};

`;

const METRO_BABEL_PRESET_REG = /metro-react-native-babel-preset/;

interface IImportPluginOpts {
  libraryName: string;
  libraryDirectory?: string;
  style?: boolean;
  camel2DashComponentName?: boolean;
}

export default (api: IApi) => {
  const {
    utils: { Mustache, resolve },
  } = api;

  api.modifyBabelPresetOpts((opts) => {
    return {
      ...opts,
      import: (opts.import || []).concat([{ libraryName: '@ant-design/react-native' }]),
    };
  });

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
    const babelConfigFile = join(api.paths.absSrcPath || '', 'babel.config.js');
    if (existsSync(babelConfigFile)) {
      try {
        const userPresets = require(babelConfigFile).presets;
        if (Array.isArray(userPresets)) {
          presets.push(...userPresets.filter((it) => !METRO_BABEL_PRESET_REG.test(it) && !presets.includes(it)));
        }
      } catch (ignored) {}
      try {
        const userPlugins = require(babelConfigFile).plugins;
        if (Array.isArray(userPlugins)) {
          plugins.push(...userPlugins);
        }
      } catch (ignored) {}
    }

    const extraBabelPlugins = api.config.extraBabelPlugins;
    if (Array.isArray(extraBabelPlugins)) {
      plugins.push(...extraBabelPlugins.filter(Boolean));
    } else if (extraBabelPlugins) {
      plugins.push(extraBabelPlugins);
    }

    if (presetOpts.import) {
      /**
       * presetOpts: 即@umijs/babel-preset-umi的配置参数。
       * 目前只有@umijs/plugin-antd用到 import 选项，其他配置赞不支持。避免和haul的babel配置冲突
       */
      plugins.push(
        ...presetOpts.import.map((importOpts: IImportPluginOpts) => {
          return [resolve.sync('babel-plugin-import', { basedir: api.paths.cwd }), importOpts, importOpts.libraryName];
        }),
      );
    }

    const extraBabelPresets = api.config.extraBabelPresets;
    if (Array.isArray(extraBabelPresets)) {
      presets.push(...extraBabelPresets.filter(Boolean));
    } else if (extraBabelPresets) {
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
