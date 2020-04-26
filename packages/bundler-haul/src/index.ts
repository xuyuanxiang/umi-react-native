import { IApi } from 'umi';
import { yargs } from '@umijs/utils';
import { fork } from 'child_process';
import generateFiles from '@umijs/preset-built-in/lib/plugins/commands/generateFiles';
import { cleanTmpPathExceptCache } from '@umijs/preset-built-in/lib/plugins/commands/buildDevUtils';

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
    logger,
  } = api;
  async function handler({ args }: { args: yargs.Arguments<IDevRNCommandArguments> }): Promise<void> {
    const defaultPort = process.env.PORT || args?.port || api.config.devServer?.port;
    const port = await portfinder.getPortPromise({
      port: defaultPort ? parseInt(String(defaultPort), 10) : 8081,
    });
    const host = process.env.HOST || api.config.devServer?.host;

    cleanTmpPathExceptCache({
      absTmpPath: absTmpPath!,
    });

    const unwatch = await generateFiles({ api, watch: process.env.WATCH !== 'none' });

    const argv: string[] = ['start'];

    if (port) {
      argv.push('--port', port + '');
    }

    const child = fork(require.resolve('@haul-bundler/cli/bin/haul.js'), argv, {
      // stdio: 'inherit',
      cwd: absTmpPath,
    });
    child.on('close', (code) => {
      logger.info('close...');
      unwatch();
      process.exit(code);
    });
    process.on('SIGINT', () => {
      child.kill('SIGINT');
    });
    process.on('SIGTERM', () => {
      child.kill('SIGTERM');
    });
  }

  api.registerCommand({
    name: 'dev-rn',
    description: 'starts react-native dev webserver',
    fn: handler,
  } as ICommand);
};
