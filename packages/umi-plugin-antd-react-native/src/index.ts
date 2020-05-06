import { IApi } from '@umijs/types';

export default (api: IApi) => {
  api.modifyBabelPresetOpts((opts) => {
    return {
      ...opts,
      import: (opts.import || []).concat([
        { libraryName: '@ant-design/react-native', libraryDirectory: 'es', style: true },
      ]),
    };
  });
};
