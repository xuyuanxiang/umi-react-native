import { join, resolve } from 'path';
import { execFileSync } from 'child_process';
import { IApi } from 'umi';
import { generateFiles, asyncClean } from '../../utils';

export interface IHaulBundleOptions {
  config?: string;
  dev: boolean;
  minify?: boolean;
  platform: string;
  assetsDest?: string;
  bundleOutput?: string;
  sourcemapOutput?: string;
  progress: string;
  maxWorkers?: number;
}

type Arguments<T = {}> = T & {
  /** Non-option arguments */
  _: string[];
  /** The script name or node command */
  $0: string;
  /** All remaining options */
  [argName: string]: unknown;
};

interface ICommand {
  name: string;
  alias?: string;
  description?: string;
  details?: string;
  fn: {
    <T>({ args }: { args: Arguments<T> }): void;
  };
}

export default (api: IApi) => {
  const {
    paths: { absTmpPath, absOutputPath },
    utils: { rimraf },
  } = api;
  async function handler({ args }: { args: Arguments<IHaulBundleOptions> }): Promise<void> {
    const platform = args.platform;
    if (!platform) {
      throw new TypeError('The required argument: "--platform <ios|android>" was not present!');
    }
    const assetPath = resolve(absOutputPath || '', args.assetsDest || 'assets');
    const bundleOutput = resolve(
      absOutputPath || '',
      args.bundleOutput || platform === 'ios' ? 'main.jsbundle' : `index.${platform}.bundle`,
    );
    const sourcemapOutput = join(absOutputPath || '', `${bundleOutput}.map`);
    const argv: string[] = [
      'bundle',
      '--platform',
      platform,
      '--config',
      join(absTmpPath || '', 'haul.config.js'),
      '--entry-file',
      join(absTmpPath || '', 'index.js'),
      '--bundle-output',
      bundleOutput,
      '--sourcemap-output',
      sourcemapOutput,
      '--assets-dest',
      assetPath,
      '--progress',
      'minimal',
      '--dev',
      JSON.stringify(api.env === 'development'),
    ];

    if (absTmpPath) {
      await asyncClean(api, absTmpPath, '.cache', 'node_modules');
    }

    await generateFiles({ api, watch: false });

    const cli = require.resolve('@haul-bundler/cli/bin/haul.js');
    execFileSync(cli, argv, {
      stdio: 'inherit',
      cwd: absTmpPath,
      env: process.env,
    });

    if (process.env.RM_TMPDIR !== 'none') {
      absTmpPath && rimraf.sync(absTmpPath);
    }
  }

  api.registerCommand({
    name: 'build-rn',
    description: 'builds react-native offline bundle',
    fn: handler,
  } as ICommand);
};
