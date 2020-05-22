export default `import _ from 'lodash';
import { makeConfig, withPolyfills } from '{{{ haulPresetPath }}}';

const transform = ({ config }) => {
  return _.defaultsDeep({{{ webpackConfig }}}, config);
};

{{#bundles}}
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
        ['@@/umi', ...{{{ dependencies }}}],
        {
          additionalSetupFiles: ['@@/umi'],
        }
      ),
      dll: true,
      type: 'indexed-ram-bundle',
      transform,
    },
    host: {
      entry: '@/index',
      dependsOn: ['index'],
      app: true,
      transform,
    },
    ...{{{ bundles }}},
  },
});
{{/bundles}}
{{^bundles}}
export default makeConfig({
  bundles: {
    index: {
      entry: withPolyfills(
        '@/index',
        {
          additionalSetupFiles: ['@@/react-native/polyfill', '@@/core/plugin'],
        }
      ),
      transform,
    },
  },
});
{{/bundles}}

`;
