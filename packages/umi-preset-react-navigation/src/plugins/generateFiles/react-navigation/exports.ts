import { IApi } from 'umi';
import { dirname } from 'path';

const TEMPLATE = `export {
  useNavigation,
  useRoute as useScreen,
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
} from '{{{ reactNavigationPath }}}';

`;

export default (api: IApi) => {
  const {
    utils: { Mustache, winPath },
  } = api;
  api.onGenerateFiles(() => {
    api.writeTmpFile({
      path: 'react-navigation/exports.ts',
      content: Mustache.render(TEMPLATE, {
        reactNavigationPath: winPath(dirname(require.resolve('@react-navigation/native/package.json'))),
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
