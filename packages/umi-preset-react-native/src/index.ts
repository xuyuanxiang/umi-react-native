export default function () {
  return {
    plugins: [
      require.resolve('./plugins/commands/watch'),
      require.resolve('./plugins/generateFiles/react-native/exports'),
      require.resolve('./plugins/generateFiles/react-native/polyfill'),
      require.resolve('./plugins/generateFiles/react-native/runtime'),
      require.resolve('./plugins/generateFiles/babelConfig'),
      require.resolve('./plugins/generateFiles/metroConfig'),
      require.resolve('./plugins/generateFiles/index'),
      require.resolve('./plugins/features/reactNative'),
    ],
  };
}
