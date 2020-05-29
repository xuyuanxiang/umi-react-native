import { IApi } from 'umi';
import { existsSync } from 'fs';
import { getUserLib } from '../utils';

export default (api: IApi) => {
  const HAUL_CLI_PATH = getUserLib({
    api,
    target: '@haul-bundler/cli/package.json',
    dir: true,
  });

  // umi-preset-react-native 扩展配置
  api.describe({
    key: 'haul',
    config: {
      default: existsSync(HAUL_CLI_PATH),
      schema(joi) {
        return joi
          .alternatives(
            joi.boolean(),
            joi
              .object({
                extraBundles: joi
                  .array()
                  .items(
                    joi.object({
                      name: joi.string().required(),
                      entry: joi.alternatives(joi.string(), joi.array().items(joi.string())).required(),
                    }),
                  )
                  .optional(),
              })
              .description('添加用户工程自定义分包'),
          )
          .optional()
          .description('Haul 配置项');
      },
    },
  });
};
