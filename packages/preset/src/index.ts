export default function () {
  const plugins = [
    require.resolve('./plugins/generateFiles/rn/runtime'),
    require.resolve('./plugins/generateFiles/rn/renderClient'),
    require.resolve('./plugins/generateFiles/index'),
    require.resolve('./plugins/features/reactNative'),
  ];

  // if (process.env.UMI_RN_VERSION) {
  //   plugins.unshift(
  //     require.resolve('./plugins/features/alias'),
  //     require.resolve('./plugins/features/define'),
  //     require.resolve('./plugins/features/extraBabelPlugins'),
  //     require.resolve('./plugins/features/extraBabelPresets'),
  //     require.resolve('./plugins/features/globalJS'),
  //     require.resolve('./plugins/features/outputPath'),
  //     require.resolve('./plugins/features/plugins'),
  //     require.resolve('./plugins/features/presets'),
  //     require.resolve('./plugins/features/proxy'),
  //   );
  // }
  return {
    plugins,
  };
}
