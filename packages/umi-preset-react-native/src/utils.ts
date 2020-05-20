import { existsSync, readdir, stat, writeFile } from 'fs';
import { dirname, join } from 'path';
import { EOL } from 'os';
import { IApi, IRoute } from 'umi';
import memoizerific from 'memoizerific';
import { INDEX_TPL, BABEL_CONFIG_TPL, HAUL_CONFIG_TPL, METRO_CONFIG_TPL } from './templates';

export function assertExists(dependencyPath: string): void {
  if (!existsSync(dependencyPath)) {
    throw new TypeError(
      `未能找到：${dependencyPath}${EOL}请确认：${EOL}  1. 是否在 react-native 工程根目录下执行；${EOL}  2. 是否已执行 \`yarn install\` 安装所有依赖。`,
    );
  }
}
const DEFAULTS = {
  bracketSpacing: false,
  jsxBracketSameLine: true,
  singleQuote: true,
  trailingComma: 'all',
  parser: 'babel',
};

export const createFormatter = (api: IApi): ((code: string) => string) => {
  try {
    const prettier = require(api.utils.resolve.sync('prettier', { basedir: api.paths.absSrcPath }));
    try {
      const options = require(join(api.paths.absSrcPath || '', '.prettierrc.js'));
      return memoizerific(3)((code: string) => prettier.format(code, { ...DEFAULTS, ...options }));
    } catch (ignored) {
      return memoizerific(3)((code: string) => prettier.format(code, DEFAULTS));
    }
  } catch (ignored) {
    return (code: string) => code;
  }
};

export const asyncWriteTmpFile = memoizerific(3)(
  (api: IApi, filename: string, content: string): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      writeFile(filename, createFormatter(api)(content), 'utf8', (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  },
);

export function asyncClean(api: IApi, ...excludes: string[]): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const path = api.paths.absTmpPath;
    if (!path) return resolve();
    stat(path, (_, stats) => {
      if (!_ && stats.isDirectory()) {
        readdir(path, (err, files) => {
          if (err) {
            reject(err);
          } else if (Array.isArray(files) && files.length > 0) {
            Promise.all(
              files.map(
                (file) =>
                  new Promise((resolve, reject) => {
                    if (excludes.includes(file)) {
                      resolve();
                    } else {
                      api.utils.rimraf(join(path, file), (error) => (error ? reject(error) : resolve()));
                    }
                  }),
              ),
            ).then(() => resolve(), reject);
          } else {
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  });
}

interface IBundle {
  name: string;
  entry: string | string[] | { entryFiles: string[]; setupFiles: string[] };
  type?: 'basic-bundle' | 'indexed-ram-bundle' | 'file-ram-bundle';
  dependsOn?: string[];
  app?: boolean;
  transform?: string;
}

export function transformRoutesToBundle(routes: IRoute[], parent?: IRoute): IBundle[] {
  const bundles: IBundle[] = [];
  for (const route of routes) {
    if (Array.isArray(route.routes)) {
      bundles.push(...transformRoutesToBundle(route.routes, route));
    } else {
      if (route.component) {
        bundles.push({
          name: route.component,
          entry:
            parent && parent.component
              ? { entryFiles: [route.component], setupFiles: [parent.component] }
              : route.component,
          dependsOn: ['index'],
          app: true,
          transform: 'transform',
        });
      }
    }
  }
  return bundles;
}

export function bundlesToJSON(api: IApi, bundles: IBundle[]): string {
  return JSON.stringify(
    api.utils.lodash
      .chain(bundles)
      .map(({ name, ...bundle }) => ({ [name]: bundle }))
      .reduce((prev, curr) => ({ ...prev, ...curr }))
      .value(),
  ).replace(/("transform"\s?:"transform")/g, (global, m1) => {
    return global.replace(m1, 'transform');
  });
}

export async function routesToJSON(api: IApi) {
  const {
    utils: { lodash, winPath },
    paths: { cwd },
  } = api;
  const SEPARATOR = '^^^';
  const EMPTY_PATH = '_';
  const routes = await api.getRoutes();

  // 因为要往 routes 里加无用的信息，所以必须 deep clone 一下，避免污染
  const clonedRoutes = lodash.cloneDeep(routes);

  if (api.config.dynamicImport) {
    patchRoutes(clonedRoutes);
  }

  function patchRoutes(routes: IRoute[]) {
    routes.forEach(patchRoute);
  }

  function patchRoute(route: IRoute) {
    if (route.component && !isFunctionComponent(route.component)) {
      const webpackChunkName = route.component
        .replace(new RegExp(`^${lastSlash(winPath(cwd || '/'))}`), '')
        .replace(/^.(\/|\\)/, '')
        .replace(/(\/|\\)/g, '__')
        .replace(/\.jsx?$/, '')
        .replace(/\.tsx?$/, '')
        .replace(/^src__/, '')
        .replace(/\.\.__/g, '')
        // 约定式路由的 [ 会导致 webpack 的 code splitting 失败
        // ref: https://github.com/umijs/umi/issues/4155
        // eslint-disable-next-line no-useless-escape
        .replace(/[\[\]]/g, '')
        // 插件层的文件也可能是路由组件，比如 plugin-layout 插件
        .replace(/^.umi-production__/, 't__')
        .replace(/^pages__/, 'p__')
        .replace(/^page__/, 'p__');
      route.component = [route.component, webpackChunkName, route.path || EMPTY_PATH].join(SEPARATOR);
    }
    if (route.routes) {
      patchRoutes(route.routes);
    }
  }

  function isFunctionComponent(component: string) {
    // eslint-disable-next-line no-useless-escape
    return /^\((.+)?\)(\s+)?=>/.test(component) || /^function([^\(]+)?\(([^\)]+)?\)([^{]+)?{/.test(component);
  }

  function replacer(key: string, value: any) {
    switch (key) {
      case 'component':
        if (isFunctionComponent(value)) return value;
        if (api.config.dynamicImport) {
          const [component] = value.split(SEPARATOR);
          let loading = '';
          if (api.config.dynamicImport.loading) {
            loading = `,loading: require('${api.config.dynamicImport.loading}').default`;
          }
          return `dynamic({
          loader: async () => {
            await Multibundle.loadBundle('${component}');
            return Multibundle.getBundleExport('${component}');
          }${loading}})`;
        } else {
          return `require('${value}').default`;
        }
      case 'wrappers':
        // eslint-disable-next-line no-case-declarations
        const wrappers = value.map((wrapper: string) => {
          return `require('${wrapper}').default`;
        });
        return `[${wrappers.join(', ')}]`;
      default:
        return value;
    }
  }

  return (
    JSON.stringify(clonedRoutes, replacer, 2)
      // eslint-disable-next-line no-useless-escape
      .replace(/\"component\": (\"(.+?)\")/g, (global, m1, m2) => {
        return `"component": ${m2.replace(/\^/g, '"')}`;
      })
      // eslint-disable-next-line no-useless-escape
      .replace(/\"wrappers\": (\"(.+?)\")/g, (global, m1, m2) => {
        return `"wrappers": ${m2.replace(/\^/g, '"')}`;
      })
      .replace(/\\r\\n/g, '\r\n')
      .replace(/\\n/g, '\r\n')
  );

  function lastSlash(str: string) {
    return str[str.length - 1] === '/' ? str : `${str}/`;
  }
}

function kebabCase(input: string): string {
  return input
    .replace(input.charAt(0), input.charAt(0).toLowerCase())
    .replace(/[A-Z]/g, ($1) => $1.replace($1, `-${$1.toLowerCase()}`));
}

export function argsToArgv(args: { [key: string]: unknown }): string[] {
  const results: string[] = [];
  Object.keys(args).forEach((key) => {
    if (/^[a-zA-Z]+$/.test(key)) {
      const value = args[key];
      if (typeof value !== 'undefined' && value != null) {
        results.push(`--${kebabCase(key)}`, JSON.stringify(value));
      }
    }
  });
  return results;
}

interface IImportPluginOpts {
  libraryName: string;
  libraryDirectory?: string;
  style?: boolean;
  camel2DashComponentName?: boolean;
}

export async function generateConfigFiles(api: IApi): Promise<void> {
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

  if (api.config.haul) {
    presets.push('@haul-bundler/babel-preset-react-native');
  } else if (api.config.expo) {
    presets.push('babel-preset-expo');
  } else {
    presets.push('module:metro-react-native-babel-preset');
  }

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
    asyncWriteTmpFile(api, join(cwd, 'index.js'), INDEX_TPL),
  ];

  if (api.config.hual) {
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
          bundles: bundlesToJSON(api, transformRoutesToBundle(routes)),
        }),
      ),
    );
  }

  await Promise.all(tasks);
}

export async function generateFiles(api: IApi, watch?: boolean): Promise<() => void> {
  const generateFiles = require(api.utils.resolve.sync('@umijs/preset-built-in/lib/plugins/commands/generateFiles', {
    basedir: process.env.UMI_DIR,
  })).default;

  return generateFiles({ api, watch });
}

interface IGetUserLibDirOptions {
  api: IApi;
  /**
   * 比如：'react-native'（目录） 或者 'react-router/esm/index.js'（文件）
   */
  target: string;
  /**
   * true-返回目录绝对路径，false-返回文件绝对路径
   */
  dir?: boolean;
  /**
   * 用户目录查找起始路径
   */
  basedir?: string;
}

export function getUserLib(opts: IGetUserLibDirOptions): string {
  const { api, target, dir, basedir = api.paths.absSrcPath } = opts;
  let path: string | undefined;
  try {
    path = api.utils.resolve.sync(target, {
      basedir,
    });
  } catch (ignored) {
    path = target;
  }
  if (dir) {
    return dirname(path);
  } else {
    return path;
  }
}
