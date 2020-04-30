export default function () {
  return {
    plugins: [
      require.resolve('./plugins/generateFiles/react-native/runtime'),
      require.resolve('./plugins/generateFiles/react-native/umi'),
      require.resolve('./plugins/generateFiles/babelConfig'),
      // require.resolve('./plugins/generateFiles/haulConfig'),
      require.resolve('./plugins/features/reactNative'),
      require.resolve('./plugins/features/haul'),
    ],
  };
}
