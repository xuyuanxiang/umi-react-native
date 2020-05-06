import { IApi } from '@umijs/types';
import { DefaultTheme } from '@react-navigation/native';

export default (api: IApi) => {
  api.describe({
    key: 'navigation',
    config: {
      default: {
        theme: {
          dark: DefaultTheme.dark,
          colors: {
            ...DefaultTheme.colors,
          },
        },
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

  api.modifyDefaultConfig((config) => {
    config.theme = {
      ...DefaultTheme.colors,
    };

    return config;
  });
};
