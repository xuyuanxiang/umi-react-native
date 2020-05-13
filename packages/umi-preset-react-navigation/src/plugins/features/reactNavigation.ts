import { IApi } from 'umi';

export default (api: IApi) => {
  api.describe({
    key: 'reactNavigation',
    config: {
      default: {
        theme: {
          // 使用 ant-design 默认配色作为 Navigation 的默认主题
          dark: false,
          colors: {
            primary: '#108ee9',
            background: '#ffffff',
            card: '#ffffff',
            text: '#000000',
            border: '#dddddd',
          },
        },
        type: 'stack', // Navigator 类型
        enableSafeAreasSupport: true, // 默认启用对 iOS Safe Areas 的适配/支持
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
