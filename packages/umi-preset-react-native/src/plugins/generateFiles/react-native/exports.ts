import { IApi } from 'umi';

const CONTENT = `export {
  BackButton,
  AndroidBackButton,
} from 'react-router-native';

`;

export default (api: IApi) => {
  api.onGenerateFiles(() => {
    api.writeTmpFile({
      path: 'react-native/exports.ts',
      content: CONTENT,
    });
  });
  api.addUmiExports(() => [
    {
      exportAll: true,
      source: '../react-native/exports',
    },
  ]);
};
