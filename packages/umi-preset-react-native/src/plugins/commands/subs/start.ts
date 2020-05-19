import { join } from 'path';
import { fork, ChildProcess } from 'child_process';
import { IApi } from 'umi';
import { Arguments } from './shared';
import { asyncClean, argsToArgv } from '../../../utils';

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
    utils: { lodash, resolve },
  } = api;

  const generateFiles = require(resolve.sync('@umijs/preset-built-in/lib/plugins/commands/generateFiles', {
    basedir: process.env.UMI_DIR,
  })).default;

  return async function start(opts: { args: Arguments<IHaulStartOptions> }): Promise<void> {
    const defaultsArgs: IHaulStartOptions = {
      config: join(paths.absTmpPath || '', 'react-native', 'haul.config.js'),
      dev: true,
    };
    const watch = process.env.WATCH !== 'none';
    const argv: string[] = ['start', ...argsToArgv(lodash.defaults(defaultsArgs, opts.args))];
    const cli = require.resolve('@haul-bundler/cli/bin/haul.js');

    await asyncClean(api, '.cache', 'node_modules');
    const unwatch = await generateFiles({ api, watch });

    api.logger.info(`haul ${argv.join(' ')}`);
    const child: ChildProcess = fork(cli, argv, {
      stdio: 'inherit',
      cwd: paths.cwd,
      env: process.env,
    });
    child.on('exit', () => {
      process.exit();
    });
    process.on('exit', () => {
      unwatch();
    });
    process.on('SIGINT', () => {
      child.kill('SIGINT');
    });
    process.on('SIGTERM', () => {
      child.kill('SIGTERM');
    });
  };
};
