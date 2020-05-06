import { existsSync, readdir, stat } from 'fs';
import { join } from 'path';
import { EOL } from 'os';
import { IApi } from '@umijs/types';

export function assertExists(dependencyPath: string): void {
  if (!existsSync(dependencyPath)) {
    throw new TypeError(
      `未能找到：${dependencyPath}${EOL}请确认：${EOL}  1. 是否在 react-native 工程根目录下执行；${EOL}  2. 是否已执行 \`yarn install\` 安装所有依赖。`,
    );
  }
}

export async function generateFiles({ api, watch }: { api: IApi; watch?: boolean }) {
  const {
    paths,
    utils: { chokidar, lodash, winPath },
  } = api;

  async function generate() {
    api.logger.debug('generate files');
    await api.applyPlugins({
      key: 'onGenerateFiles',
      type: api.ApplyPluginsType.event,
    });
  }

  const watchers: any[] = [];

  await generate();

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
    // process.on('SIGINT', () => {
    //   console.log('SIGINT');
    //   unwatch();
    // });
  }

  function unwatch() {
    watchers.forEach((watcher) => {
      watcher.close();
    });
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
      lodash.throttle(async (event, path) => {
        // debug(`${event} ${path}`);
        await generate();
      }, 100),
    );
  }

  return unwatch;
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
