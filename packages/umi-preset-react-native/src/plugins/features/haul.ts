import { IApi } from 'umi';

export default (api: IApi) => {
  api.describe({
    key: 'haul',
    config: {
      default: { bundles: { index: { entry: './umi.ts' } } },
      schema(joi) {
        return joi
          .object({
            bundles: joi.object().optional(),
          })
          .optional();
      },
    },
  });
};
