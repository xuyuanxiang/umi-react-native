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
      entry: withPolyfills('./index.ts'),
      transform,
    },
  },
});

`;
