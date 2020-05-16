import { join } from 'path';
import { IApi } from 'umi';
import { asyncClean } from '../../utils';

export default (api: IApi) => {
  const {
    paths,
    utils: { lodash, chokidar, winPath },
  } = api;
  async function handler(): Promise<void> {
    const watch = process.env.WATCH !== 'none';

    if (watch) {
      api.logger.info('Starting umi in watch mode.');
    }
    await asyncClean(api, '.cache', 'node_modules');

    async function generate() {
      await api.applyPlugins({
        key: 'onGenerateFiles',
        type: api.ApplyPluginsType.event,
      });
    }

    await generate();

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
          await generate();
        }, 250),
      );
      unwatches.push(watcher);
    }

    api.logger.info(
      'You can use the `react-native run-ios` or `react-native run-android` command to launch your application.',
    );
    process.on('exit', () => {
      unwatchAll();
    });
  }

  api.registerCommand({
    name: 'watch',
    description: 'watch sourcecode files and regenerate on changes',
    fn: handler,
  });
};
