import { IApi } from 'umi';
import { yargs } from '@umijs/utils';
import generateFiles from '@umijs/preset-built-in/lib/plugins/commands/generateFiles';
import { cleanTmpPathExceptCache } from '@umijs/preset-built-in/lib/plugins/commands/buildDevUtils';
import { watchPkg } from '@umijs/preset-built-in/lib/plugins/commands/dev/watchPkg';
import { HaulBundler } from './HaulBundler';

export interface IDevRNCommandArguments {
  port?: number;
  dev: boolean;
  interactive?: boolean;
  minify?: boolean;
  tempDir?: string;
  config: string;
  eager: string;
  maxWorkers?: number;
  skipHostCheck: boolean;
}

interface ICommand {
  name: string;
  alias?: string;
  description?: string;
  details?: string;
  fn: {
    <T>({ args }: { args: yargs.Arguments<T> }): void;
  };
}

export default (api: IApi) => {
  const {
    utils: { portfinder },
    paths: { absTmpPath },
  } = api;
  async function handler({ args }: { args: yargs.Arguments<IDevRNCommandArguments> }): Promise<void> {
    const defaultPort = process.env.PORT || args?.port || api.config.devServer?.port;
    const port = await portfinder.getPortPromise({
      port: defaultPort ? parseInt(String(defaultPort), 10) : 8081,
    });
    const bundler = new HaulBundler({ cwd: absTmpPath, config: api.config });
    const unwatchs: Function[] = [];
    const isWatch = process.env.WATCH !== 'none';

    function unwatch(): void {
      for (const unwatch of unwatchs) {
        try {
          unwatch();
        } catch (ignored) {}
      }
    }

    function watch(fn: unknown): void {
      if (typeof fn === 'function') {
        unwatchs.push(fn);
      }
    }

    if (absTmpPath) {
      cleanTmpPathExceptCache({
        absTmpPath,
      });
    }

    const unwatchGenerateFiles = await generateFiles({ api, watch: isWatch });

    watch(unwatchGenerateFiles);

    bundler.start({ port });

    if (isWatch) {
      const unwatchPkg = watchPkg({
        cwd: api.cwd,
        onChange() {
          console.log();
          api.logger.info(`Plugins in package.json changed.`);
          bundler.restart();
        },
      });
      watch(unwatchPkg);
    } else {
    }

    process.on('SIGINT', () => {
      unwatch();
      bundler.destroy('SIGINT');
    });
    process.on('SIGTERM', () => {
      unwatch();
      bundler.destroy('SIGTERM');
    });
  }

  api.registerCommand({
    name: 'dev-rn',
    description: 'starts react-native dev webserver',
    fn: handler,
  } as ICommand);
};
