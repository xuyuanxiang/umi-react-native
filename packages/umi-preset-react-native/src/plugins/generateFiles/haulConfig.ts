import { IApi } from '@umijs/types';
import { dirname, join } from 'path';
import webpack from 'webpack';
import Config from 'webpack-chain';

const CONTENT = `import _ from 'lodash';
import { makeConfig } from '{{{ haulPresetPath }}}';

const transform = ({ config }) => {
  return _.defaultsDeep({{{ webpackConfig }}}, config);
};

const projectConfig = {{{ haulConfig }}};

const bundles = projectConfig.bundles;

export default makeConfig({
  bundles: _.chain(bundles)
    .keys()
    .flatMap((bundleName) => ({
      [bundleName]: _.defaultsDeep(bundles[bundleName], {transform}),
    }))
    .value(),
  ...projectConfig,
});

`;

function createCSSRule() {
  // no-op
}

export default (api: IApi) => {
  const {
    utils: { winPath, Mustache, semver },
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
    const env = api.env === 'production' ? 'production' : 'development';
    const webpackConfig = new Config();
    const alias = api.config.alias;
    if (typeof alias === 'object') {
      Object.keys(alias).forEach((key) => {
        const value = alias[key];
        if (value) {
          webpackConfig.resolve.alias.set(key, value);
        }
      });
    }
    await api.applyPlugins({
      type: api.ApplyPluginsType.modify,
      key: 'chainWebpack',
      initialValue: webpackConfig,
      args: {
        webpack,
        createCSSRule,
      },
    });
    if (typeof api.config.chainWebpack === 'function') {
      await api.config.chainWebpack(webpackConfig, { env, webpack, createCSSRule });
    }
    // 防止加载umi Common JS格式的代码
    webpackConfig.resolve.alias.set('umi', winPath(join(absTmpPath || '', 'react-native', 'umi')));
    const config = webpackConfig.toConfig();
    api.writeTmpFile({
      path: 'haul.config.js',
      content: Mustache.render(CONTENT, {
        haulPresetPath: winPath(detectHaulPresetPath()),
        haulConfig: JSON.stringify(api.config?.haul || {}, null, 2),
        webpackConfig: JSON.stringify(config, null, 2),
      }),
    });
  });
};
