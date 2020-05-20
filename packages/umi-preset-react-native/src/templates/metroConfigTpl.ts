export default `/**
 * @file umi 生成临时文件
 * @description Metro configuration for React Native: https://github.com/facebook/react-native
 *  额外添加 Metro 配置需要使用环境变量：UMI_ENV指定要加载的配置文件：metro.$UMI_ENV.config.js。
 *  比如，执行 UMI_ENV=dev umi g rn 时，会加载 metro.dev.config.js 文件中的配置，使用 mergeConfig 同该文件进行合并。
 * @see mergeConfig: https://facebook.github.io/metro/docs/configuration/#merging-configurations
 * @format
 */
{{#useUserConfig}}

const { mergeConfig } = require('metro-config');
const userConfig = require('{{{ userConfigFile }}}');
module.exports = mergeConfig({
  watchFolders: ['{{{ watchFolders }}}'],
  resolver: {
    resolverMainFields: ['react-native', 'browser', 'module', 'main'],
    sourceExts: ['js', 'jsx', 'json', 'esm.js', 'ts', 'tsx'],
    {{#extraNodeModules}}extraNodeModules: {{{ extraNodeModules }}},{{/extraNodeModules}}
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
}, userConfig);

{{/useUserConfig}}
{{^useUserConfig}}

module.exports = {
  watchFolders: ['{{{ watchFolders }}}'],
  resolver: {
    resolverMainFields: ['react-native', 'browser', 'module', 'main'],
    sourceExts: ['js', 'jsx', 'json', 'esm.js', 'ts', 'tsx'],
    {{#extraNodeModules}}extraNodeModules: {{{ extraNodeModules }}},{{/extraNodeModules}}
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
};

{{/useUserConfig}}
`;
