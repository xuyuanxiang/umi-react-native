import { join, resolve } from 'path';
import { execFileSync } from 'child_process';
import { IApi } from 'umi';
import { Arguments, ICommand } from './shared';
import { asyncClean, argsToArgv } from '../../utils';

export interface IBundleOptions {
  config?: string;
  entryFile?: string;
  dev?: boolean;
  minify?: boolean;
  platform?: string;
  assetsDest?: string;
  bundleOutput?: string;
  sourcemapOutput?: string;
  progress?: string;
  maxWorkers?: number;
}

export default (api: IApi) => {
  const {
    paths,
    utils: { rimraf, lodash },
  } = api;
  async function handler(opts: { args: Arguments<IBundleOptions> }): Promise<void> {
    const platform = opts.args.platform;
    if (!platform) {
      throw new TypeError('The required argument: "--platform <ios|android>" was not present!');
    }
    process.env.NODE_ENV = 'production';
    const assetsDest = opts.args.assetsDest || resolve(paths.absOutputPath || '', 'assets');
    const bundleOutput =
      opts.args.bundleOutput ||
      resolve(paths.absOutputPath || '', platform === 'ios' ? 'main.jsbundle' : `index.${platform}.bundle`);
    const defaultsArgs: IBundleOptions = {
      config: join(paths.absTmpPath || '', 'haul.config.js'),
      entryFile: join(paths.absTmpPath || '', 'umi.ts'),
      platform,
      bundleOutput,
      assetsDest,
      dev: false,
    };
    const argv: string[] = ['bundle', ...argsToArgv(lodash.defaults(defaultsArgs, opts.args))];

    await asyncClean(api, '.cache', 'node_modules');

    await api.applyPlugins({
      key: 'onGenerateFiles',
      type: api.ApplyPluginsType.event,
    });

    api.logger.info(`haul ${argv.join(' ')}`);
    execFileSync(require.resolve('@haul-bundler/cli/bin/haul.js'), argv, {
      stdio: 'inherit',
      cwd: paths.absTmpPath,
      env: process.env,
    });

    if (process.env.RM_TMPDIR !== 'none') {
      rimraf.sync(paths.absTmpPath!);
    }
  }

  api.registerCommand({
    name: 'build-rn',
    description: 'builds react-native offline bundle',
    fn: handler,
  } as ICommand);
};
