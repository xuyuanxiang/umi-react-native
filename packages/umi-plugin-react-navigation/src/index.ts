import { IApi } from '@umijs/types';
import { dirname } from 'path';

export default (api: IApi) => {
  const {
    utils: { winPath },
  } = api;

  api.describe({
    key: 'navigation',
    config: {
      default: {
        theme: null,
      },
      schema(joi) {
        return joi
          .object({
            theme: joi.object({
              dark: joi.boolean(),
              colors: joi.object({
                primary: joi.string(),
                background: joi.string(),
                card: joi.string(),
                text: joi.string(),
                border: joi.string(),
              }),
            }),
          })
          .optional();
      },
    },
  });

  api.modifyRendererPath(() => winPath(dirname(require.resolve('umi-renderer-react-native/package.json'))));
};
