import { IApi } from '@umijs/types';
import { dirname } from 'path';

const CONTENT = `module.exports = {
  presets: ['{{{ presetPath }}}'],
};

`;

export default (api: IApi) => {
  const {
    utils: { winPath, Mustache },
  } = api;
  api.onGenerateFiles(async () => {
    api.writeTmpFile({
      path: 'babel.config.js',
      content: Mustache.render(CONTENT, {
        presetPath: winPath(dirname(require.resolve('@haul-bundler/babel-preset-react-native/package.json'))),
      }),
    });
  });
};
