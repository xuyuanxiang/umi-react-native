export default `/**
 * @file umi 生成临时文件
 */
import _ from 'lodash';
import { makeConfig, withPolyfills } from '{{{ haulPresetPath }}}';

const transform = ({ config }) => {
  return _.defaultsDeep({{{ webpackConfig }}}, config);
};

{{#bundles}}
export default makeConfig({
  features: {
    multiBundle: 2,
  },
  bundles: {
    index: {
      entry: withPolyfills('@/index'),
      dll: true,
      // type: 'indexed-ram-bundle',
      transform,
    },
    main: {
      entry: withPolyfills(
        ['@@/umi', ...{{{ dependencies }}}],
        {
          additionalSetupFiles: ['@@/umi'],
        }
      ),
      dll: true,
      // type: 'indexed-ram-bundle',
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
