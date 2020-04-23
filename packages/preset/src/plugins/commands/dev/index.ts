import { IApi } from '@umijs/types';

export default (api: IApi): void => {
  const { logger } = api;
  api.registerCommand({
    name: 'rn-dev',
    description: 'start react-native dev server',
    fn({ args }) {
      logger.debug('rn-dev:', args);
    },
  });
};
