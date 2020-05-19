import { existsSync, readdir, stat, writeFile } from 'fs';
import { join } from 'path';
import { EOL } from 'os';
import { IApi, IRoute } from 'umi';
import memoizerific from 'memoizerific';

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
