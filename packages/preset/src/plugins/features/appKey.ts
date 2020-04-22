import { IApi } from '@umijs/types';

export default (api: IApi) => {
  api.describe({
    key: 'appKey',
    config: {
      default: '',
      schema(joi) {
        return joi.string().allow('');
      },
    },
  });
};
