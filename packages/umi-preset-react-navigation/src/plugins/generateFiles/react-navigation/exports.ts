import { IApi } from 'umi';

const exportsTpl = `export {
  useNavigation,
  useRoute,
  useFocusEffect,
  useNavigationState,
  useIsFocused,
  useLinkTo,
  useLinkProps,
  useLinkBuilder,
  useLinking,
  useScrollToTop,
  CommonActions,
  StackActions,
} from '@react-navigation/native';

`;

export default (api: IApi) => {
  api.onGenerateFiles(() => {
    api.writeTmpFile({
      path: 'react-navigation/exports.ts',
      content: exportsTpl,
    });
  });

  api.addUmiExports(() => [
    {
      exportAll: true,
      source: '../react-navigation/exports',
    },
  ]);
};
