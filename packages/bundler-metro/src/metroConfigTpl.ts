export default `
const path = require('path');
const {mergeConfig} = require('metro-config');
const userConfig = {{{ userConfigs }}};

const extraNodeModules = {{{ alias }}};
const watchFolders = {{{ watchFolders }}};

module.exports = mergeConfig(userConfig, {
  resolver: {
    resolverMainFields: ['module', 'browser', 'main'],
    extraNodeModules: new Proxy(extraNodeModules, {
      get: (target, name) =>
        name in target
          ? target[name]
          : path.join('{{{ nodeModulePath }}}', name),
    }),
  },
  watchFolders,
});

`;
