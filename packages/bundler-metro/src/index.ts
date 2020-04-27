import { dirname, join } from 'path';
import { existsSync } from 'fs';
import { fork } from 'child_process';
import { IApi } from '@umijs/types';
import { yargs } from '@umijs/utils';
import { name } from '../package.json';
import generateFiles from './generateFiles';
import babelConfigTpl from './babelConfigTpl';
import clean from './asyncClean';
import metroConfigTpl from './metroConfigTpl';

interface ICommand {
  name: string;
  alias?: string;
  description?: string;
  details?: string;
  fn: {
    <T>({ args }: { args: yargs.Arguments<T> }): void;
  };
}

export interface IMetroStartOptions {
  assetPlugins?: string[];
  cert?: string;
  customLogReporterPath?: string;
  host?: string;
  https?: boolean;
  maxWorkers?: number;
  key?: string;
  platforms?: string[];
  port?: number;
  resetCache?: boolean;
  sourceExts?: string[];
  transformer?: string;
  verbose?: boolean;
  watchFolders?: string[];
  config?: string;
  projectRoot?: string;
  interactive: boolean;
}

export default (api: IApi) => {
  const {
    utils: { semver, Mustache, lodash, resolve, winPath },
    paths: { absTmpPath, absNodeModulesPath, absSrcPath, cwd },
  } = api;
  async function handler({ args }: { args: yargs.Arguments<IMetroStartOptions> }): Promise<void> {
    const argv: string[] = [
      'start',
      '--projectRoot',
      absTmpPath || '',
      '--config',
      join(absTmpPath || '', 'metro.config.js'),
    ];

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
      // 保留 '.cache' 和 'node_modules'文件夹
      await clean(absTmpPath, '.cache', 'node_modules');
    }

    watch(await generateFiles({ api, watch: isWatch }));

    const child = fork(resolve.sync('react-native/cli', { basedir: absSrcPath }), argv, {
      stdio: 'inherit',
      cwd: absTmpPath,
    });
    child.on('close', (code) => {
      unwatch();
      process.exit(code);
    });

    process.on('SIGINT', () => {
      unwatch();
      child.kill('SIGINT');
    });

    process.on('SIGTERM', () => {
      unwatch();
      child.kill('SIGTERM');
    });
  }

  api.onStart(() => {
    if (
      semver.valid(api.config?.reactNative?.version) &&
      semver.gte(api.config.reactNative.version, '0.62.0-rc.0') &&
      semver.lt(api.config.reactNative.version, '1.0.0')
    ) {
      return;
    }
    throw new TypeError(
      `"${name}" 只支持 react-native："0.62.0-rc.0及以上（>= 0.62.0-rc.0）" 和 "1.0.0以下（< 1.0.0）" 版本。`,
    );
  });

  api.registerCommand({
    name: 'dev-rn',
    description: 'starts react-native dev webserver',
    fn: handler,
  } as ICommand);

  api.onGenerateFiles(async () => {
    const buildDevUtilsPath = resolve.sync('@umijs/preset-built-in/lib/plugins/commands/buildDevUtils', {
      basedir: process.env.UMI_DIR,
    });
    const { getBundleAndConfigs } = require(buildDevUtilsPath);
    const { bundleConfigs } = await getBundleAndConfigs({ api });
    const config = bundleConfigs.filter((bundleConfig: any) => {
      return bundleConfig.entry?.umi;
    })[0];
    // const aliasObj = lodash.omit(config.resolve?.alias, ['react-dom']);
    // Object.assign(aliasObj, { [runtimeBuiltInUmiDir]: '@umijs/runtime' }); // hack for umi generateFiles: .umi/core/**/*.ts
    // const alias = JSON.stringify(aliasObj, null, 2);
    api.writeTmpFile({
      path: 'babel.config.js',
      content: Mustache.render(babelConfigTpl, {
        moduleResolverPath: winPath(dirname(require.resolve('babel-plugin-module-resolver/package.json'))),
        metroPresetsPath: winPath(resolve.sync('metro-react-native-babel-preset', { basedir: absSrcPath })),
        root: cwd,
        // alias,
      }),
    });
    const userMetroConfig = join(absSrcPath || '', 'metro.config.js');
    const userConfigs = existsSync(userMetroConfig) ? `require('${winPath(userMetroConfig)}')` : '{}';
    const watchFolders = [absTmpPath];
    api.writeTmpFile({
      path: 'metro.config.js',
      content: Mustache.render(metroConfigTpl, {
        userConfigs,
        watchFolders: JSON.stringify(watchFolders, null, 2),
        // alias,
      }),
    });
  });
};
