import { IApi } from 'umi';

export default (api: IApi) => {
  api.describe({
    key: 'reactNavigation',
    config: {
      default: {
        theme: {
          dark: false,
          colors: {
            primary: '#108ee9',
            background: '#ffffff',
            card: '#ffffff',
            text: '#000000',
            border: '#dddddd',
          },
        },
        type: 'stack',
        enableSafeAreasSupport: true,
      },
      schema(joi) {
        return joi
          .object({
            type: joi.string().allow('stack', 'drawer', 'bottom-tabs').optional(),
            theme: joi
              .object({
                dark: joi.boolean().required(),
                colors: joi.object({
                  primary: joi.string().required(),
                  background: joi.string().required(),
                  card: joi.string().required(),
                  text: joi.string().required(),
                  border: joi.string().required(),
                }),
              })
              .optional(),
            enableSafeAreasSupport: joi.boolean().optional(),
          })
          .optional();
      },
    },
  });
};
