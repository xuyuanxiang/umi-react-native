import { IApi } from 'umi';
import { dirname } from 'path';

const TEMPLATE = `export {
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
  useTheme,
  CommonActions,
  StackActions,
  DrawerActions,
  TabActions,
} from '{{{ reactNavigationPath }}}';

export {
  Header,
  HeaderBackButton,
  HeaderBackground,
  HeaderTitle,
  useGestureHandlerRef,
  useCardAnimation,
  useHeaderHeight,
} from '{{{ reactNavigationStackPath }}}';

`;

export default (api: IApi) => {
  const {
    utils: { Mustache, winPath, resolve },
    paths: { absSrcPath },
  } = api;

  /**
   * 优先读取用户目录下依赖的绝对路径
   * @param library 比如：'react-native'（目录） 或者 'react-router/esm/index.js'（文件）
   * @param defaults library找不到时的缺省值
   * @param dir true-返回目录绝对路径，false-返回文件绝对路径
   * @param basedir 用户目录查找起始路径
   */
  function getUserLibDir(library: string, defaults: string, dir: boolean = false, basedir = absSrcPath): string {
    try {
      const path = resolve.sync(library, {
        basedir,
      });
      if (dir) {
        return dirname(path);
      } else {
        return path;
      }
    } catch (ignored) {}
    return defaults;
  }

  api.onGenerateFiles(() => {
    api.writeTmpFile({
      path: 'react-navigation/exports.ts',
      content: Mustache.render(TEMPLATE, {
        reactNavigationPath: winPath(
          getUserLibDir(
            '@react-navigation/native/package.json',
            dirname(require.resolve('@react-navigation/native/package.json')),
            true,
          ),
        ),
        reactNavigationStackPath: winPath(
          getUserLibDir(
            '@react-navigation/stack/package.json',
            dirname(require.resolve('@react-navigation/stack/package.json')),
            true,
          ),
        ),
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
