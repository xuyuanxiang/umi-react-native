import { join } from 'path';
import { IApi } from 'umi';
import { existsSync } from 'fs';
import { asyncClean, asyncWriteTmpFile } from '../../utils';
import BABEL_CONFIG_TPL from './babelConfigTpl';
import METRO_CONFIG_TPL from './metroConfigTpl';
import INDEX_TPL from './indexTpl';

interface IImportPluginOpts {
  libraryName: string;
  libraryDirectory?: string;
  style?: boolean;
  camel2DashComponentName?: boolean;
}

interface IRNGeneratorArguments {
  dev?: boolean;
}

export default (api: IApi) => {
  const {
    paths,
    utils: { lodash, winPath, resolve, Mustache },
  } = api;

  const generateFiles = require(resolve.sync('@umijs/preset-built-in/lib/plugins/commands/generateFiles', {
    basedir: process.env.UMI_DIR,
  })).default;

  async function genConfigFiles(): Promise<void> {
    const env = process.env.NODE_ENV === 'production' ? 'production' : 'development';
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
          extensions: ['.ts', '.tsx', '.native.js', '.native.jsx', '.esm.js', '.js', '.jsx', '.json'],
          alias: config.resolve.alias,
        },
      ],
    ];
    const presets: (string | [string, any, string?])[] = [];

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

    const userConfigFile: string | boolean = join(
      api.paths.absSrcPath || '',
      `metro.${process.env.UMI_ENV || 'local'}.config.js`,
    );

    await Promise.all([
      asyncWriteTmpFile(
        api,
        join(paths.absSrcPath || '', 'babel.config.js'),
        Mustache.render(BABEL_CONFIG_TPL, {
          presets: JSON.stringify(lodash.uniqWith(babelConfig.presets, lodash.isEqual)),
          plugins: JSON.stringify(lodash.uniqWith(babelConfig.plugins, lodash.isEqual)),
        }),
      ),
      asyncWriteTmpFile(
        api,
        join(api.paths.absSrcPath || '', 'metro.config.js'),
        api.utils.Mustache.render(METRO_CONFIG_TPL, {
          watchFolders: [paths.absTmpPath],
          // extraNodeModules: PLATFORM === 'win32' ? null : JSON.stringify(config.resolve.alias),
          userConfigFile: winPath(userConfigFile),
          useUserConfig: existsSync(userConfigFile),
        }),
      ),
      asyncWriteTmpFile(api, join(paths.absSrcPath || '', 'index.js'), INDEX_TPL),
    ]);
  }

  async function handler(watch?: boolean): Promise<void> {
    const start = Date.now();
    api.logger.info(`Starting react-native generator in ${process.env.NODE_ENV} mode.`);

    await asyncClean(api, '.cache', 'node_modules');

    const unwatch = await generateFiles({ api, watch });
    await genConfigFiles();

    if (watch) {
      api.logger.info(
        'You can open another terminal and type: `yarn react-native run-ios` or `yarn react-native run-android` to launch your application.',
      );
    }

    process.on('exit', () => {
      unwatch();
      if (!watch) {
        api.logger.info(`Successfully completed in ${Date.now() - start}ms.`);
      }
    });
  }

  class RNGenerator {
    cwd: string;
    args: IRNGeneratorArguments;
    dev?: boolean;
    constructor(opts: { cwd: string; args: IRNGeneratorArguments }) {
      this.cwd = opts.cwd;
      this.args = opts.args;
      this.dev = Boolean(opts.args.dev);
      if (this.dev) {
        process.env.NODE_ENV = 'development';
      } else {
        process.env.NODE_ENV = 'production';
      }
    }

    async run(): Promise<void> {
      await this.writing();
    }

    async writing(): Promise<void> {
      await handler(this.dev);
    }
  }

  api.registerGenerator({
    key: 'rn',
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    Generator: RNGenerator,
  });
};
