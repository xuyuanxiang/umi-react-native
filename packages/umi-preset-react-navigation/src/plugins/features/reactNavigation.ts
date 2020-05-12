import { IApi } from 'umi';
import { dirname } from 'path';
import { dependencies } from '../../../package.json';

export default (api: IApi) => {
  const {
    utils: { winPath },
  } = api;

  api.describe({
    key: 'reactNavigation',
    config: {
      default: {
        theme: null,
        type: 'stack',
        safeAreasSupport: true,
      },
      schema(joi) {
        return joi
          .object({
            type: joi.string().allow('stack', 'drawer', 'bottom-tabs'),
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
            safeAreasSupport: joi.boolean().optional(),
          })
          .optional();
      },
    },
  });

  api.addProjectFirstLibraries(() =>
    Object.keys(dependencies).map((name) => ({
      name,
      path: winPath(dirname(require.resolve(`${name}/package.json`))),
    })),
  );
};
