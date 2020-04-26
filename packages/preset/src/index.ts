export default function () {
  return {
    plugins: [
      require.resolve('./plugins/generateFiles/rn/runtime'),
      require.resolve('./plugins/generateFiles/rn/renderClient'),
      require.resolve('./plugins/generateFiles/babel'),
      require.resolve('./plugins/generateFiles/haul'),
      require.resolve('./plugins/generateFiles/index'),
      require.resolve('./plugins/features/reactNative'),
    ],
  };
}
