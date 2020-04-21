import { IApi } from '@umijs/types';
import generateFiles from '../generateFiles';
import createLogger from '../../../createLogger';

const logger = createLogger('command:build');

export default (api: IApi): void => {
  logger.debug('register');
  api.registerCommand({
    name: 'build',
    description: 'build offline bundle',
    fn: async ({ args }) => {
      console.log('args:', args);
      await generateFiles({ api, watch: false });
    },
  });
};
