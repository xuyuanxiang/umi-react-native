import { IApi } from 'umi';
import { join } from 'path';
import { yargs } from '@umijs/utils';
import { fork, spawn } from 'child_process';
import {
  INTERACTIVE_MODE_DEFAULT,
  getProjectConfigPath,
  getNormalizedProjectConfigBuilder,
  Server,
  Runtime,
} from '@haul-bundler/core';
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

    // const { NODE_INSPECTOR } = process.env;
    // let { nodeInspector } = args;
    // nodeInspector = nodeInspector || NODE_INSPECTOR;
    // const runtime = new Runtime();
    // // Experimental
    // if (nodeInspector) {
    //   const wait = nodeInspector === 'wait';
    //   const inspector = require('inspector');
    //   inspector.open(undefined, undefined, wait);
    // }
    //
    // try {
    //   const configPath = getProjectConfigPath(absTmpPath || '', args.config || 'haul.config.js');
    //   logger.info('configPath:', configPath);
    //   const projectConfig = getNormalizedProjectConfigBuilder(runtime, configPath)(runtime, {
    //     platform: '',
    //     root: absTmpPath!,
    //     dev: true,
    //     port,
    //     bundleMode: 'multi-bundle',
    //     bundleTarget: 'server',
    //     assetsDest: absTmpPath!,
    //     minify: false,
    //     maxWorkers: args.maxWorkers,
    //   });
    //
    //   let parsedEager;
    //   const list = (args.eager || '').split(',').map((item) => item.trim());
    //   if (list.length === 1 && (list[0] === 'true' || list[0] === 'false')) {
    //     parsedEager = list[0] === 'true' ? ['ios', 'android'] : [];
    //   } else {
    //     parsedEager = list;
    //   }
    //
    //   logger.info('project config:', projectConfig);
    //   const server = new Server(runtime, configPath, {
    //     dev: true,
    //     noInteractive: !INTERACTIVE_MODE_DEFAULT,
    //     minify: false,
    //     assetsDest: absTmpPath!,
    //     root: absTmpPath!,
    //     eager: parsedEager,
    //     platforms: projectConfig.platforms,
    //     bundleNames: Object.keys(projectConfig.bundles),
    //     skipHostCheck: false,
    //   });
    //
    //   await server.listen(projectConfig.server.host, port);
    // } catch (error) {
    //   unwatch();
    //   runtime.unhandledError(error);
    //   runtime.complete(1);
    // }

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
