import { existsSync, readdir, stat, writeFile } from 'fs';
import { dirname, join } from 'path';
import { EOL } from 'os';
import { IApi } from 'umi';
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
