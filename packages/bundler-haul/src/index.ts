import { dirname, join } from 'path';
import { fork } from 'child_process';
import { IApi } from '@umijs/types';
import { yargs } from '@umijs/utils';
import { name } from '../package.json';
import generateFiles from './generateFiles';
import babelConfigTpl from './babelConfigTpl';
import haulConfigTpl from './haulConfigTpl';
import clean from './asyncClean';

export interface IHaulStartOptions {
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
    utils: { portfinder, semver, Mustache, lodash, resolve, winPath },
    paths: { absTmpPath },
  } = api;
  async function handler({ args }: { args: yargs.Arguments<IHaulStartOptions> }): Promise<void> {
    const defaultPort = process.env.PORT || args?.port;
    const port = await portfinder.getPortPromise({
      port: defaultPort ? parseInt(String(defaultPort), 10) : 8081,
    });
    const argv: string[] = ['start', '--config', join(absTmpPath || '', 'haul.config.js')];

    if (port) {
      argv.push('--port', port + '');
    }
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

    const child = fork(require.resolve('@haul-bundler/cli/bin/haul.js'), argv, {
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
      semver.gte(api.config.reactNative.version, '0.59.0') &&
      semver.lt(api.config.reactNative.version, '1.0.0')
    ) {
      return;
    }
    throw new TypeError(`"${name}" 只支持 react-native："0.59.0及以上（>= 0.59.0）" 和 "1.0.0以下（< 1.0.0）" 版本。`);
  });

  api.registerCommand({
    name: 'dev-rn',
    description: 'starts react-native dev webserver',
    fn: handler,
  } as ICommand);

  function detectHaulPresetPath(): string {
    if (semver.valid(api.config?.reactNative?.version)) {
      const minor = semver.minor(api.config.reactNative.version);
      if (minor >= 60) {
        return dirname(require.resolve('@haul-bundler/preset-0.60/package.json'));
      } else {
        return dirname(require.resolve('@haul-bundler/preset-0.59/package.json'));
      }
    }
    throw new TypeError('未知 react-native 版本！');
  }

  api.onGenerateFiles(async () => {
    api.writeTmpFile({
      path: 'babel.config.js',
      content: Mustache.render(babelConfigTpl, {
        presetPath: winPath(dirname(require.resolve('@haul-bundler/babel-preset-react-native/package.json'))),
      }),
    });
    const buildDevUtilsPath = resolve.sync('@umijs/preset-built-in/lib/plugins/commands/buildDevUtils', {
      basedir: process.env.UMI_DIR,
    });
    const { getBundleAndConfigs } = require(buildDevUtilsPath);
    const { bundleConfigs } = await getBundleAndConfigs({ api });
    const config = bundleConfigs.filter((bundleConfig: any) => {
      return bundleConfig.entry?.umi;
    })[0];

    const alias = lodash.omit(config.resolve?.alias, ['react-dom']);
    Object.assign(alias, {
      // haul似乎没有开启treeShaking, 会加载umi common js格式的代码， 导致webpack构建时：out of memory
      umi: resolve.sync('umi/dist/index.esm.js', { basedir: absTmpPath }),
    });
    api.writeTmpFile({
      path: 'haul.config.js',
      content: Mustache.render(haulConfigTpl, {
        haulPresetPath: winPath(detectHaulPresetPath()),
        alias: JSON.stringify(alias, null, 2),
      }),
    });
  });
};
