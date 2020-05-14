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
      },
      schema(joi) {
        return joi
          .object({
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
          })
          .optional();
      },
    },
  });
};
