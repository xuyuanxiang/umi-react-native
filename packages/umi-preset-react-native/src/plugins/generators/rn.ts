import { dirname, join } from 'path';
import { IApi } from 'umi';
import { asyncClean, asyncWriteTmpFile, transformRoutesToBundle } from '../../utils';
import { existsSync } from 'fs';
import BABEL_CONFIG_TPL from './babelConfigTpl';
import METRO_CONFIG_TPL from './metroConfigTpl';
import INDEX_TPL from './indexTpl';
import HAUL_CONFIG_TPL from './haulConfigTpl';

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
    utils: { lodash, chokidar, winPath, resolve, Mustache, semver },
  } = api;

  function detectHaulPresetPath(): string {
    if (semver.valid(api.config?.reactNative?.version)) {
      const minor = semver.minor(api.config.reactNative.version);
      if (minor >= 60) {
        return dirname(require.resolve('@haul-bundler/preset-0.60/package.json'));
      } else {
        return dirname(require.resolve('@haul-bundler/preset-0.59/package.json'));
      }
    }
    throw new TypeError('未知 react-native 版本！');
  }

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

    // 接收用户值
    if (typeof api.config.chainWebpack === 'function') {
      await api.config.chainWebpack(webpackConfig, { env, webpack, createCSSRule: lodash.noop });
    }

    /**
     * 防止加载 umi 包 Common JS 格式的代码
     *  umi for WEB 使用 webpack treeShaking，运行时加载的是 ES Module 格式的代码：umi/dist/index.esm.js；
     *  但 RN 的模块加载方式不支持 treeShaking，会加载 umi Common JS 代码：umi/index.js，其中包含了大量 Node 工具类库。
     *  在 haul 构建时甚至会导致 out of memory。
     * 另外，使用其他方式：api.chainWebpack 或者 api.addProjectFirstLibraries "umi" alias 都会被覆盖，所以放到这里最终写 haul.config.js 时强行设置
     */
    webpackConfig.resolve.alias.set('umi', resolve.sync('umi/dist/index.esm.js', { basedir: process.env.UMI_DIR }));

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

    const routes = await api.getRoutes();

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
      await asyncWriteTmpFile(
        api,
        join(paths.absSrcPath || '', 'haul.config.js'),
        Mustache.render(HAUL_CONFIG_TPL, {
          haulPresetPath: winPath(detectHaulPresetPath()),
          haulConfig: JSON.stringify(api.config?.haul || {}),
          webpackConfig: JSON.stringify(config),
          dependencies: JSON.stringify(
            lodash.keys(
              lodash.omit(config.resolve.alias, [
                '@',
                '@@',
                'react-dom',
                'react-router-dom',
                'regenerator-runtime',
                './core/polyfill',
              ]),
            ),
          ),
          bundles: JSON.stringify(transformRoutesToBundle(routes)),
        }),
      ),
      asyncWriteTmpFile(api, join(paths.absSrcPath || '', 'index.js'), INDEX_TPL),
    ]);
    api.logger.info('Config files generated.');
  }

  async function generateFiles() {
    await api.applyPlugins({
      key: 'onGenerateFiles',
      type: api.ApplyPluginsType.event,
    });
    api.logger.info('Temp files generated.');
  }

  async function handler(watch?: boolean): Promise<void> {
    const start = Date.now();
    api.logger.info(`Starting react-native generator in ${process.env.NODE_ENV} mode.`);

    await asyncClean(api, '.cache', 'node_modules');

    await generateFiles();
    await genConfigFiles();

    const unwatches: ((() => void) | { close: () => void })[] = [];

    if (watch) {
      const watcherPaths = await api.applyPlugins({
        key: 'addTmpGenerateWatcherPaths',
        type: api.ApplyPluginsType.add,
        initialValue: [
          paths.absPagesPath!,
          join(paths.absSrcPath!, api.config?.singular ? 'layout' : 'layouts'),
          join(paths.absSrcPath!, 'app.tsx'),
          join(paths.absSrcPath!, 'app.ts'),
          join(paths.absSrcPath!, 'app.jsx'),
          join(paths.absSrcPath!, 'app.js'),
        ],
      });
      lodash.uniq<string>(watcherPaths.map((p: string) => winPath(p))).forEach((p: string) => {
        createWatcher(p);
      });
    }

    function unwatchAll() {
      while (unwatches.length) {
        const unwatch = unwatches.pop();
        try {
          if (typeof unwatch === 'function') {
            unwatch();
          } else if (unwatch && typeof unwatch.close === 'function') {
            unwatch.close();
          }
        } catch (ignored) {}
      }
    }

    function createWatcher(path: string) {
      const watcher = chokidar.watch(path, {
        // ignore .dotfiles and _mock.js
        // eslint-disable-next-line no-useless-escape
        ignored: /(^|[\/\\])(_mock.js$|\..)/,
        ignoreInitial: true,
      });
      watcher.on(
        'all',
        lodash.throttle(async () => {
          api.logger.info('File change detected. Starting regenerate...');
          await generateFiles();
        }, 250),
      );
      unwatches.push(watcher);
    }

    if (watch) {
      api.logger.info(
        'You can open another terminal and type: `yarn react-native run-ios` or `yarn react-native run-android` to launch your application.',
      );
    }

    process.on('exit', () => {
      unwatchAll();
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
