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
{{#enableSafeAreasSupport}}
export {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
  useSafeAreaFrame,
} from 'react-native-safe-area-context';
{{/enableSafeAreasSupport}}
`;

export default (api: IApi) => {
  api.onGenerateFiles(() => {
    api.writeTmpFile({
      path: 'react-navigation/exports.ts',
      content: api.utils.Mustache.render(exportsTpl, {
        enableSafeAreasSupport: Boolean(api.config?.reactNavigation?.enableSafeAreasSupport),
      }),
    });
  });

  api.addUmiExports(() => [
    {
      exportAll: true,
      source: '../react-navigation/exports',
    },
  ]);
};
