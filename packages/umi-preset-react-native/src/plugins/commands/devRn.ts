import { join } from 'path';
import { fork, ChildProcess, execFileSync } from 'child_process';
import { IApi } from 'umi';
import { Arguments, ICommand } from './shared';
import { asyncClean, argsToArgv } from '../../utils';

export interface IHaulStartOptions {
  port?: number;
  dev?: boolean;
  interactive?: boolean;
  minify?: boolean;
  tempDir?: string;
  config?: string;
  eager?: string;
  maxWorkers?: number;
  skipHostCheck?: boolean;
}

export default (api: IApi) => {
  const {
    paths,
    utils: { lodash, chokidar, winPath },
  } = api;
  async function handler(opts: { args: Arguments<IHaulStartOptions> }): Promise<void> {
    const defaultsArgs: IHaulStartOptions = {
      config: join(paths.absTmpPath || '', 'haul.config.js'),
      dev: true,
    };
    const watch = process.env.WATCH !== 'none';
    const argv: string[] = ['start', ...argsToArgv(lodash.defaults(defaultsArgs, opts.args))];
    const cli = require.resolve('@haul-bundler/cli/bin/haul.js');

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
          await generate();
          execFileSync(cli, ['reload']);
        }, 250),
      );
      unwatches.push(watcher);
    }

    api.logger.info(`haul ${argv.join(' ')}`);
    const child: ChildProcess = fork(cli, argv, {
      stdio: 'inherit',
      cwd: paths.absTmpPath,
      env: process.env,
    });
    child.on('exit', () => {
      process.exit();
    });
    process.on('exit', () => {
      unwatchAll();
    });
  }

  api.registerCommand({
    name: 'dev-rn',
    description: 'starts react-native dev server',
    fn: handler,
  } as ICommand);
};
