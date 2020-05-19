export default `/**
 * @file umi 生成临时文件
 * @description haul 配置，暂不支持自定义 haul 配置。
 * @format
 */
import _ from 'lodash';
import { makeConfig, withPolyfills } from '{{{ haulPresetPath }}}';

const transform = ({ config }) => {
  return _.defaultsDeep({{{ webpackConfig }}}, config);
};

const bundles = _.flatMap({{{ bundles }}}, bundle => ({[bundle.name]: _.merge(bundle, { transform })}));

export default makeConfig({
  templates: {
    filename: {
      ios: '[bundleName].ios.bundle',
    },
  },
  features: {
    multiBundle: 2,
  },
  bundles: {
    base: {
      entry: withPolyfills(
        ['./index.js', ...{{{ dependencies }}}],
        {
          additionalSetupFiles: ['@@/react-native/polyfill', '@@/core/plugin'],
        }
      ),
      dll: true,
      type: 'indexed-ram-bundle',
      transform,
    },
    ...bundles,
  },
});

`;
