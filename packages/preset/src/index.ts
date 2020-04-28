export default function () {
  return {
    plugins: [
      require.resolve('./plugins/commands/devRn'),
      // require.resolve('./plugins/generateFiles/rn/runtime'),
      require.resolve('./plugins/generateFiles/rn/umi'),
      // require.resolve('./plugins/generateFiles/rn/renderClient'),
      require.resolve('./plugins/generateFiles/babelConfig'),
      require.resolve('./plugins/generateFiles/haulConfig'),
      require.resolve('./plugins/generateFiles/index'),
      require.resolve('./plugins/features/reactNative'),
    ],
  };
}
