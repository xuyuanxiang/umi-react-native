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
  {{#dev}}
  templates: {
    filename: {
      ios: '[bundleName].ios.bundle',
    },
  },
  {{/dev}}
  features: {
    multiBundle: 2,
  },
  bundles: {
    index: (env) => {
      if (env.platform === 'ios') {
        return { entry: './index' };
      } else {
        return {
          entry: withPolyfills(
            ['@@/umi', ...{{{ dependencies }}}],
            {
              additionalSetupFiles: ['@@/umi'],
             }
          ),
          dll: true,
          transform,
        };
      }
    },
    main: (env) => {
      if (env.platform === 'android') {
        return { entry: './index' };
      } else {
        return {
          entry: withPolyfills(
            ['@@/umi', ...{{{ dependencies }}}],
            {
              additionalSetupFiles: ['@@/umi'],
            }
          ),
          dll: true,
          transform,
        };
      }
    },
    ...{{{ bundles }}}.map(({name, ...rests}) => ({[name]: (env) => ({
      ...rests,
      transform,
      app: true,
      dependsOn: env.platform === 'android' ? ['index'] : ['main'],
    })})).reduce((curr,prev) => ({...curr, ...prev})),
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
