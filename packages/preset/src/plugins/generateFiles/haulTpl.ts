export default `import { withPolyfills, makeConfig } from '{{{ haulPresetPath }}}';

const transform = ({ config }) => {
  config.resolve.alias = {
    ...config.resolve.alias,
    ...{{{ alias }}},
  };
};

export default makeConfig({
  bundles: {
    index: {
      // entry: withPolyfills(
      //   ['./index.ts', 'react', 'react-native', 'react-router', 'react-router-config', 'react-router-native', 'umi', 'history'],
      //   {
      //     additionalSetupFiles: ['./index.ts'],
      //   }
      // ),
      entry: withPolyfills('./index.ts'),
      transform,
    },
  },
});

`;
