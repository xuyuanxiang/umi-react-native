import { IApi } from 'umi';

const CONTENT = `export { Link as NativeLink, NativeRouter, BackButton, AndroidBackButton } from 'react-router-native';

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
      specifiers: ['NativeLink', 'NativeRouter', 'BackButton', 'AndroidBackButton'],
      source: `../rn/runtime`,
    };
  });
};
