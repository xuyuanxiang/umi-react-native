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
export {default as SafeAreaView} from 'react-native-safe-area-view';

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
