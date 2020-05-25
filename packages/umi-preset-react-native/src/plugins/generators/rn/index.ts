import { IApi } from 'umi';
import { join } from 'path';
import { asyncClean } from '../../utils';
import generateConfigFiles from './generateConfigFiles';

interface IRNGeneratorArguments {
  dev?: boolean;
}

export default (api: IApi) => {
  const {
    utils: { lodash, winPath, chokidar },
    paths,
  } = api;
  async function generateFiles() {
    await api.applyPlugins({
      key: 'onGenerateFiles',
      type: api.ApplyPluginsType.event,
    });
  }

  async function handler(watch?: boolean): Promise<void> {
    const start = Date.now();
    api.logger.info(`Starting react-native generator in ${process.env.NODE_ENV} mode.`);

    await asyncClean(api, '.cache', 'node_modules');
    await generateFiles();
    await generateConfigFiles(api);

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
        }, 500),
      );
      unwatches.push(watcher);
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
