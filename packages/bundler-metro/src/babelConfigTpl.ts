export default `
module.exports = {
  presets: ['{{{ metroPresetsPath }}}'],
  plugins: [
    [
      '{{{ moduleResolverPath }}}',
      {
        root: ['{{{ root }}}'],
        extensions: [
          '.ios.ts',
          '.android.ts',
          '.ts',
          '.ios.tsx',
          '.android.tsx',
          '.tsx',
          '.jsx',
          '.js',
          '.json',
        ],
        alias: {{{ alias }}},
      },
    ],
  ],
};

`;
