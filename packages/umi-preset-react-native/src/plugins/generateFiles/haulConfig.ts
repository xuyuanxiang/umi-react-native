import { IApi } from '@umijs/types';
import { dirname } from 'path';
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
    utils: { winPath, Mustache, semver, resolve },
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

    // 接收插件值
    await api.applyPlugins({
      type: api.ApplyPluginsType.modify,
      key: 'chainWebpack',
      initialValue: webpackConfig,
      args: {
        webpack,
        createCSSRule,
      },
    });

    // 接收用户值
    if (typeof api.config.chainWebpack === 'function') {
      await api.config.chainWebpack(webpackConfig, { env, webpack, createCSSRule });
    }

    /**
     * 防止加载 umi 包 Common JS 格式的代码
     *  umi for WEB 使用 webpack treeShaking，运行时加载的是 ES Module 格式的代码：umi/dist/index.esm.js；
     *  但 RN 的模块加载方式不支持 treeShaking，会加载 umi Common JS 代码：umi/index.js，其中包含了大量 Node 工具类库。
     *  在 haul 构建时甚至会导致 out of memory。
     * 另外，使用其他方式：api.chainWebpack 或者 api.addProjectFirstLibraries "umi" alias 都会被覆盖，所以放到这里最终写 haul.config.js 时强行设置
     */
    webpackConfig.resolve.alias.set('umi', resolve.sync('umi/dist/index.esm.js', { basedir: process.env.UMI_DIR }));

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
