export default function () {
  return {
    plugins: [
      require.resolve('./plugins/features/reactNative'),
      require.resolve('./plugins/generateFiles/react-native/exports'),
      require.resolve('./plugins/generateFiles/react-native/polyfill'),
      require.resolve('./plugins/generateFiles/react-native/routes'),
      require.resolve('./plugins/generateFiles/react-native/runtime'),
      require.resolve('./plugins/generators/rn'),
    ],
  };
}
