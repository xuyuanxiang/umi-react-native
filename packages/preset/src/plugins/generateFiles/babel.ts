import { IApi } from 'umi';
import { dirname } from 'path';

const TPL = `module.exports = {
  presets: ['{{{ presetPath }}}'],
};

`;

export default (api: IApi) => {
  const {
    utils: { Mustache, winPath },
  } = api;

  api.onGenerateFiles(async () => {
    api.writeTmpFile({
      path: 'babel.config.js',
      content: Mustache.render(TPL, {
        presetPath: winPath(dirname(require.resolve('@haul-bundler/babel-preset-react-native/package.json'))),
      }),
    });
  });
};
