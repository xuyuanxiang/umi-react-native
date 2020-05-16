import { IApi } from 'umi';
import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';
const CONTENT = `/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
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
  resolver: {
    resolverMainFields: ['react-native', 'browser', 'module', 'main'],
    sourceExts: ['js', 'jsx', 'json', 'esm.js', 'ts', 'tsx'],
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

export default (api: IApi) => {
  api.onGenerateFiles(async () => {
    const userConfigFile: string | boolean = join(
      api.paths.absSrcPath || '',
      `metro.${process.env.UMI_ENV || 'local'}.config.js`,
    );
    writeFileSync(
      join(api.paths.absSrcPath || '', 'metro.config.js'),
      api.utils.Mustache.render(CONTENT, {
        watchFolders: api.paths.absTmpPath,
        userConfigFile: api.utils.winPath(userConfigFile),
        useUserConfig: existsSync(userConfigFile),
      }),
      'utf8',
    );
  });
};
