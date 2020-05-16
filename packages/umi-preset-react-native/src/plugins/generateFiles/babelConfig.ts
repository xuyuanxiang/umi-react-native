import { IApi } from 'umi';
import { join } from 'path';
import { existsSync, writeFileSync } from 'fs';

const CONTENT = `/**
 * @file umi 生成临时文件
 */
module.exports = {
  presets: {{{presets}}},
  plugins: {{{plugins}}},
};

`;

interface IImportPluginOpts {
  libraryName: string;
  libraryDirectory?: string;
  style?: boolean;
  camel2DashComponentName?: boolean;
}

export default (api: IApi) => {
  const {
    utils: { Mustache, resolve, lodash },
    paths,
  } = api;

  api.onGenerateFiles(async () => {
    const env = api.env === 'production' ? 'production' : 'development';
    const webpack = require(resolve.sync('webpack', { basedir: process.env.UMI_DIR }));
    const Config = require(resolve.sync('webpack-chain', { basedir: process.env.UMI_DIR }));

    const webpackConfig = new Config();
    const alias = api.config.alias;
    if (typeof alias === 'object') {
      Object.keys(alias).forEach((key) => {
        const value = alias[key];
        if (value) {
          webpackConfig.resolve.alias.set(key, value);
        }
      });
    }

    // 接收插件值
    await api.applyPlugins({
      type: api.ApplyPluginsType.modify,
      key: 'chainWebpack',
      initialValue: webpackConfig,
      args: {
        webpack,
        createCSSRule: lodash.noop,
      },
    });

    const config = webpackConfig.toConfig();

    const plugins: (string | [string, any, string?])[] = [
      [
        require.resolve('babel-plugin-module-resolver'),
        {
          root: [paths.absSrcPath],
          extensions: ['.ios.js', '.android.js', '.native.js', '.esm.js', '.js', '.ts', '.tsx', '.json'],
          alias: config.resolve.alias,
        },
      ],
    ];
    const presets: (string | [string, any, string?])[] = ['module:metro-react-native-babel-preset'];

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

    if (presetOpts.import) {
      /**
       * presetOpts: 即@umijs/babel-preset-umi的配置参数。
       * 目前只有@umijs/plugin-antd用到 import 选项，其他配置赞不支持。避免和haul的babel配置冲突
       */
      plugins.push(
        ...presetOpts.import.map((importOpts: IImportPluginOpts) => {
          return [
            resolve.sync('babel-plugin-import', { basedir: process.env.UMI_DIR }),
            importOpts,
            importOpts.libraryName,
          ];
        }),
      );
    }

    // 接收用户工程 babel 配置
    const babelConfigFile = join(api.paths.absSrcPath || '', 'babel.config.js');
    if (existsSync(babelConfigFile)) {
      try {
        const userPresets = require(babelConfigFile).presets;
        if (Array.isArray(userPresets)) {
          presets.push(...userPresets);
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

    writeFileSync(
      join(paths.absSrcPath || '', 'babel.config.js'),
      Mustache.render(CONTENT, {
        presets: JSON.stringify(lodash.uniqBy(babelConfig.presets, lodash.isEqual)),
        plugins: JSON.stringify(lodash.uniqBy(babelConfig.plugins, lodash.isEqual)),
      }),
      'utf8',
    );
  });
};
