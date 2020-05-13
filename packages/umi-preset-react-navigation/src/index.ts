export default function () {
  return {
    plugins: [
      require.resolve('./plugins/generateFiles/react-navigation/createNavigator'),
      require.resolve('./plugins/generateFiles/react-navigation/exports'),
      require.resolve('./plugins/generateFiles/react-navigation/runtime'),
      require.resolve('./plugins/features/reactNavigation'),
    ],
  };
}
