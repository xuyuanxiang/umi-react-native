import { IApi } from '@umijs/types';
import createLogger from '../../../createLogger';

const logger = createLogger('command:dev');

export default (api: IApi): void => {
  logger.debug('register');
  api.registerCommand({
    name: 'dev',
    description: 'start react-native dev server',
    fn({ args }) {
      console.log('args:', args);
    },
  });
};
