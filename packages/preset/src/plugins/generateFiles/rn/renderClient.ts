import { IApi } from '@umijs/types';
import content from './renderClientTpl';

export default (api: IApi) => {
  api.onGenerateFiles(async () => {
    api.writeTmpFile({
      path: 'rn/renderClient.js',
      content,
    });
  });
};
