import { IApi } from 'umi';
import { join } from 'path';
import { BABEL_CONFIG_TPL, HAUL_CONFIG_TPL, INDEX_TPL, METRO_CONFIG_TPL } from './templates';
import { existsSync } from 'fs';
import { asyncWriteTmpFile } from '../../utils';
import transformRoutesToBundle from './transformRoutesToBundle';

interface IImportPluginOpts {
  libraryName: string;
  libraryDirectory?: string;
  style?: boolean;
  camel2DashComponentName?: boolean;
}

export default async function generateConfigFiles(api: IApi): Promise<void> {
  const {
    utils: { resolve, lodash, winPath, Mustache, semver },
    paths,
  } = api;

  function detectHaulPresetPath(): string {
    if (semver.valid(api.config?.reactNative?.version)) {
      const minor = semver.minor(api.config.reactNative.version);
      if (minor >= 60) {
        return '@haul-bundler/preset-0.60';
      } else {
        return '@haul-bundler/preset-0.59';
      }
    }
    throw new TypeError('未知 react-native 版本！');
  }

  const cwd = paths.absSrcPath || '';
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

  /**
   * 防止加载 umi 包 Common JS 格式的代码
   *  umi for WEB 使用 webpack treeShaking，运行时加载的是 ES Module 格式的代码：umi/dist/index.esm.js；
   *  但 haul 不支持 treeShaking，会加载 umi Common JS 代码：umi/index.js，其中包含了大量 Node 工具类库。
   *  构建时甚至会导致 out of memory。
   * 另外，使用其他方式：api.chainWebpack 或者 api.addProjectFirstLibraries "umi" alias 都会被覆盖，所以放到这里最终写 haul.config.js 时强行设置
   */
  webpackConfig.resolve.alias.set('umi', resolve.sync('umi/dist/index.esm.js', { basedir: process.env.UMI_DIR }));
  webpackConfig.resolve.alias.set('@', paths.absSrcPath);
  webpackConfig.resolve.alias.set('@@', paths.absTmpPath);

  const config = webpackConfig.toConfig();

  const plugins: (string | [string, any, string?])[] = [];
  const presets: (string | [string, any, string?])[] = [];

  if (api.config.haul) {
    presets.push('module:@haul-bundler/babel-preset-react-native');
  } else if (api.config.expo) {
    presets.push('babel-preset-expo');
  } else {
    presets.push('module:metro-react-native-babel-preset');
  }

  plugins.push([
    require.resolve('babel-plugin-module-resolver'),
    {
      root: [paths.absSrcPath],
      extensions: ['.ts', '.tsx', '.native.js', '.native.jsx', '.esm.js', '.js', '.jsx', '.json'],
      alias: config.resolve.alias,
    },
  ]);

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

  const isExpo = Boolean(api.config.expo);
  const tasks: Promise<any>[] = [
    asyncWriteTmpFile(
      api,
      join(cwd, 'babel.config.js'),
      Mustache.render(BABEL_CONFIG_TPL, {
        presets: JSON.stringify(lodash.uniqWith(babelConfig.presets, lodash.isEqual)),
        plugins: JSON.stringify(lodash.uniqWith(babelConfig.plugins, lodash.isEqual)),
        isExpo,
      }),
    ),
    asyncWriteTmpFile(
      api,
      join(cwd, 'metro.config.js'),
      Mustache.render(METRO_CONFIG_TPL, {
        watchFolders: [paths.absTmpPath],
        userConfigFile: winPath(userConfigFile),
        useUserConfig: existsSync(userConfigFile),
      }),
    ),
    asyncWriteTmpFile(
      api,
      join(cwd, 'index.js'),
      Mustache.render(INDEX_TPL, {
        dynamicImport: Boolean(api.config.dynamicImport),
      }),
    ),
  ];

  if (api.config.haul) {
    if (api.config.dynamicImport) {
      const routes = await api.getRoutes();
      tasks.push(
        asyncWriteTmpFile(
          api,
          join(cwd, 'haul.config.js'),
          Mustache.render(HAUL_CONFIG_TPL, {
            haulPresetPath: winPath(detectHaulPresetPath()),
            webpackConfig: JSON.stringify(config, null, 2),
            dependencies: JSON.stringify(
              lodash.keys(
                lodash.omit(config.resolve.alias, [
                  '@',
                  '@@',
                  'react-dom',
                  'react-router-dom',
                  'regenerator-runtime',
                  './core/polyfill',
                  './core/routes',
                  '@@/core/routes',
                ]),
              ),
            ),
            dev: process.env.NODE_ENV === 'development',
            bundles: JSON.stringify(
              lodash.uniqBy(
                lodash.concat(
                  transformRoutesToBundle(routes),
                  lodash.isArray(api.config?.haul?.extraBundles) ? api.config.haul.extraBundles : [],
                ),
                'name',
              ),
            ),
          }),
        ),
      );
    } else {
      tasks.push(
        asyncWriteTmpFile(
          api,
          join(cwd, 'haul.config.js'),
          Mustache.render(HAUL_CONFIG_TPL, {
            haulPresetPath: winPath(detectHaulPresetPath()),
            webpackConfig: JSON.stringify(config, null, 2),
          }),
        ),
      );
    }
  }

  await Promise.all(tasks);
}
