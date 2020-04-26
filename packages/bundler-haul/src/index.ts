import { dirname } from 'path';
import { IApi } from '@umijs/types';
import { yargs } from '@umijs/utils';
import { getBundleAndConfigs } from '@umijs/preset-built-in/lib/plugins/commands/buildDevUtils';
import { name } from '../package.json';
import generateFiles from './generateFiles';
import { HaulProcess, IHaulStartOptions } from './HaulProcess';
import babelConfigTpl from './babelConfigTpl';
import haulConfigTpl from './haulConfigTpl';
import clean from './asyncClean';

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
    utils: { portfinder, semver, Mustache, winPath, lodash },
    paths: { absTmpPath },
  } = api;
  async function handler({ args }: { args: yargs.Arguments<IHaulStartOptions> }): Promise<void> {
    const defaultPort = process.env.PORT || args?.port;
    const port = await portfinder.getPortPromise({
      port: defaultPort ? parseInt(String(defaultPort), 10) : 8081,
    });
    const bundler = new HaulProcess({ cwd: absTmpPath, config: api.config });
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

    bundler.start({ port, ...args });

    process.on('SIGINT', () => {
      unwatch();
      bundler.destroy('SIGINT');
    });

    process.on('SIGTERM', () => {
      unwatch();
      bundler.destroy('SIGTERM');
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
        presetPath: dirname(require.resolve('@haul-bundler/babel-preset-react-native/package.json')),
      }),
    });
    const { bundleConfigs } = await getBundleAndConfigs({ api });
    const config = bundleConfigs.filter((bundleConfig: any) => {
      return bundleConfig.entry?.umi;
    })[0];
    api.writeTmpFile({
      path: 'haul.config.js',
      content: Mustache.render(haulConfigTpl, {
        haulPresetPath: winPath(detectHaulPresetPath()),
        alias: JSON.stringify(lodash.omit(config.resolve?.alias, ['react-dom']), null, 2),
      }),
    });
  });
};
