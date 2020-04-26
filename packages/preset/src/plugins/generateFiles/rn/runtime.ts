import { IApi } from '@umijs/types';

const CONTENT = `export {Link as NativeLink, BackButton, AndroidBackButton} from 'react-router-native';

`;

export default (api: IApi) => {
  api.onGenerateFiles(async () => {
    api.writeTmpFile({
      path: 'rn/runtime.ts',
      content: CONTENT,
    });
  });

  api.addUmiExports(() => {
    return {
      specifiers: ['NativeLink', 'BackButton', 'AndroidBackButton'],
      source: `../rn/runtime`,
    };
  });
};
