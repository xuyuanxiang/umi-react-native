import { IApi } from '@umijs/types';
import { dirname, join } from 'path';

const CONTENT = `import { withPolyfills, makeConfig } from '{{{ haulPresetPath }}}';

const transform = ({ config }) => {
  config.resolve.alias = {
    ...config.resolve.alias,
    ...{{{ alias }}},
  };
};

export default makeConfig({
  bundles: {
    index: {
      entry: withPolyfills('./index.ts'),
      transform,
    },
  },
});

`;

export default (api: IApi) => {
  const {
    utils: { winPath, Mustache, resolve, lodash, semver },
    paths: { absTmpPath },
  } = api;

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
    const buildDevUtilsPath = resolve.sync('@umijs/preset-built-in/lib/plugins/commands/buildDevUtils', {
      basedir: process.env.UMI_DIR,
    });
    const { getBundleAndConfigs } = require(buildDevUtilsPath);
    const { bundleConfigs } = await getBundleAndConfigs({ api });
    const webpackConfig = bundleConfigs.filter((bundleConfig: any) => {
      return bundleConfig.entry?.umi;
    })[0];
    const haulPresetPath = detectHaulPresetPath();
    const { makeConfig, withPolyfills } = require(haulPresetPath);
    const haulConfig = makeConfig({
      bundles: {
        index: {
          entry: withPolyfills('./index.ts'),
        },
      },
    });
    api.logger.info('haul config:', haulConfig);
    // const alias = lodash.cloneDeep(config.resolve?.alias);
    // Object.assign(alias, {
    //   // 防止加载umi Common JS格式的代码
    //   umi: winPath(join(absTmpPath || '', 'rn', 'umi')),
    // });
    // api.writeTmpFile({
    //   path: 'haul.config.js',
    //   content: Mustache.render(CONTENT, {
    //     haulPresetPath: winPath(detectHaulPresetPath()),
    //     alias: JSON.stringify(alias, null, 2),
    //   }),
    // });
  });
};
