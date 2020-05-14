import { IApi } from 'umi';

export default (api: IApi) => {
  // haul project configuration：https://github.com/callstack/haul/blob/master/docs/Configuration.md#project-configuration-reference
  api.describe({
    key: 'haul',
    config: {
      default: { bundles: { index: { entry: './umi.ts' } } },
      schema(joi) {
        return joi
          .object({
            server: joi
              .object({
                host: joi.string().optional(),
                port: joi.number().optional(),
              })
              .optional(),
            platforms: joi.array().items(joi.string()).optional(),
            templates: joi.object().optional(),
            bundles: joi.object().optional(),
            features: joi
              .object({
                multiBundle: joi.number().allow(1, 2).optional(),
              })
              .optional(),
          })
          .optional();
      },
    },
  });
};
