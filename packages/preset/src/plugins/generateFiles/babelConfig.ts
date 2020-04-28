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

  api.modifyBabelOpts((opts) => {
    api.logger.info('modifyBabelOpts:', {
      ...opts,
      presets: [
        ...opts.presets,
        winPath(dirname(require.resolve('@haul-bundler/babel-preset-react-native/package.json'))),
      ],
    });
    return {
      ...opts,
      presets: [
        ...opts.presets,
        winPath(dirname(require.resolve('@haul-bundler/babel-preset-react-native/package.json'))),
      ],
    };
  });

  // api.onGenerateFiles(async () => {
  //   api.writeTmpFile({
  //     path: 'babel.config.js',
  //     content: Mustache.render(CONTENT, {
  //       presetPath: winPath(dirname(require.resolve('@haul-bundler/babel-preset-react-native/package.json'))),
  //     }),
  //   });
  // });
};
