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

`;
