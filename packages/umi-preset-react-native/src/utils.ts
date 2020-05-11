import { existsSync, readdir, stat } from 'fs';
import { join } from 'path';
import { EOL } from 'os';
import { IApi } from 'umi';

export function assertExists(dependencyPath: string): void {
  if (!existsSync(dependencyPath)) {
    throw new TypeError(
      `未能找到：${dependencyPath}${EOL}请确认：${EOL}  1. 是否在 react-native 工程根目录下执行；${EOL}  2. 是否已执行 \`yarn install\` 安装所有依赖。`,
    );
  }
}

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
