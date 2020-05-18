/**
 * @file umi 生成临时文件
 * @description 添加额外的babel配置，请使用以下umi配置:
 *  + extraBabelPlugins配置：https://umijs.org/config#extrababelplugins
 *  + extraBabelPresets配置：https://umijs.org/config#extrababelpresets
 * @format
 */
module.exports = {
  presets: [
    'module:metro-react-native-babel-preset',
    'babel-preset-extra-fake',
  ],
  plugins: [
    [
      '/Users/xuyuanxiang/Workspaces/Github/xuyuanxiang/umi-react-native/node_modules/babel-plugin-module-resolver/lib/index.js',
      {
        root: [
          '/Users/xuyuanxiang/Workspaces/Github/xuyuanxiang/umi-react-native/test/fixtures',
        ],
        extensions: [
          '.ts',
          '.tsx',
          '.native.js',
          '.native.jsx',
          '.esm.js',
          '.js',
          '.jsx',
          '.json',
        ],
        alias: {
          'react-router':
            '/Users/xuyuanxiang/Workspaces/Github/xuyuanxiang/umi-react-native/node_modules/@umijs/preset-built-in/node_modules/react-router',
          'react-router-dom': 'react-router-native',
          history:
            '/Users/xuyuanxiang/Workspaces/Github/xuyuanxiang/umi-react-native/node_modules/history-with-query',
          '@':
            '/Users/xuyuanxiang/Workspaces/Github/xuyuanxiang/umi-react-native/test/fixtures',
          '@@':
            '/Users/xuyuanxiang/Workspaces/Github/xuyuanxiang/umi-react-native/test/fixtures/.umi-test',
          'regenerator-runtime':
            '/Users/xuyuanxiang/Workspaces/Github/xuyuanxiang/umi-react-native/node_modules/regenerator-runtime',
          react:
            '/Users/xuyuanxiang/Workspaces/Github/xuyuanxiang/umi-react-native/node_modules/@umijs/preset-built-in/node_modules/react',
          'react-dom':
            '/Users/xuyuanxiang/Workspaces/Github/xuyuanxiang/umi-react-native/node_modules/@umijs/preset-built-in/node_modules/react-dom',
          'react-native':
            '/Users/xuyuanxiang/Workspaces/Github/xuyuanxiang/umi-react-native/node_modules/react-native',
          'react-router-native':
            '/Users/xuyuanxiang/Workspaces/Github/xuyuanxiang/umi-react-native/node_modules/react-router-native',
          './core/polyfill': './react-native/polyfill',
          umi:
            '/Users/xuyuanxiang/Workspaces/Github/xuyuanxiang/umi-react-native/node_modules/umi',
        },
      },
    ],
    [
      '/Users/xuyuanxiang/Workspaces/Github/xuyuanxiang/umi-react-native/node_modules/babel-plugin-import/lib/index.js',
      {libraryName: '@ant-design/react-native'},
      '@ant-design/react-native',
    ],
    'babel-plugin-extra-fake',
  ],
};
