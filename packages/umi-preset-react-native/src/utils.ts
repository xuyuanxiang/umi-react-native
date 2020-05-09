import { existsSync, readdir, stat } from 'fs';
import { join } from 'path';
import { EOL } from 'os';
import { IApi, utils } from 'umi';

const { watchPkg } = require(utils.resolve.sync('@umijs/preset-built-in/lib/plugins/commands/dev/watchPkg', {
  basedir: process.env.UMI_DIR,
}));

const generateFiles = require(utils.resolve.sync('@umijs/preset-built-in/lib/plugins/commands/generateFiles', {
  basedir: process.env.UMI_DIR,
})).default;

export { watchPkg, generateFiles };

export function assertExists(dependencyPath: string): void {
  if (!existsSync(dependencyPath)) {
    throw new TypeError(
      `未能找到：${dependencyPath}${EOL}请确认：${EOL}  1. 是否在 react-native 工程根目录下执行；${EOL}  2. 是否已执行 \`yarn install\` 安装所有依赖。`,
    );
  }
}

export function asyncClean(api: IApi, path: string, ...excludes: string[]): Promise<void> {
  return new Promise<void>((resolve, reject) => {
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
