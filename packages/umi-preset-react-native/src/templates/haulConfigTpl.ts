export default `import _ from 'lodash';
import { makeConfig, withPolyfills } from '{{{ haulPresetPath }}}';

const transform = ({ config }) => {
  return _.defaultsDeep({{{ webpackConfig }}}, config);
};

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
    index: {
      entry: withPolyfills(
        ['@@/core/plugin', ...{{{ dependencies }}}],
        {
          additionalSetupFiles: ['@@/react-native/polyfill'],
        }
      ),
      transform,
    },
    host: {
      entry: '@/index.js',
      dependsOn: ['index'],
      app: true,
      transform,
    },
    ...{{{ bundles }}},
  },
});

`;
