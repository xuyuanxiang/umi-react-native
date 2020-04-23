import { IApi } from '@umijs/types';
import generateFiles from '@umijs/preset-built-in/lib/plugins/commands/generateFiles';

export default (api: IApi): void => {
  const { logger } = api;
  api.registerCommand({
    name: 'rn-build',
    description: 'build react-native offline bundle',
    fn: async ({ args }) => {
      logger.debug('rn-build: ', args);
      await generateFiles({ api, watch: false });
    },
  });
};
