/**
 * @file for unit test
 */
const path = require('path');

module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'import',
      {
        libraryName: '@ant-design/react-native',
      },
      '@ant-design/react-native',
    ],
    [
      'module-resolver',
      {
        root: __dirname,
        extensions: ['.ios.js', '.android.js', '.native.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@': path.join(__dirname, 'test', 'fixtures'),
          '@@': path.join(__dirname, 'test', 'fixtures', '.umi-test'),
          'react-router-dom': path.dirname(require.resolve('react-router-native/package.json')),
          // umi: require.resolve('umi/dist/index.esm.js'),
        },
      },
    ],
  ],
};
