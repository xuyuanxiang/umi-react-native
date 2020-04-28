/**
 * @description
 * 1. @umijs/runtime 中的 dynamic 缺省（默认） loading 使用了 HTML p标签和br标签，
 *    当用户启用 dynamicImport 功能，并且没有实现自定义的Loading组件时，RN会报错，所以这里做了Monkey Path。
 * 2. @umijs/runtime 中 导出的是 react-router-dom 的组件， 区别：
 *    2.1. react-router-dom 和 react-router-native 中 Link 组件是不同的实现；
 *    2.2. react-router-native 中没有 NavLink 组件；
 *    2.3. react-router-dom 中没有 BackButton 和 AndroidBackButton 组件；
 */
import { dirname } from 'path';
import { IApi } from '@umijs/types';

const CONTENT = `import React from 'react';
import {View, Text} from 'react-native';
import {dynamic as domDynamic} from '{{{ umiRuntimePath }}}';

export const dynamic = (opts = {}) =>
  domDynamic({
    ...opts,
    loading: ({error, isLoading}: {error: Error, isLoading: boolean}) => {
      if (process.env.NODE_ENV === 'development') {
        if (isLoading) {
          return <Text>loading...</Text>;
        }
        if (error) {
          return (
            <View>
              <Text>{error.message}</Text>
              <Text>{error.stack}</Text>
            </View>
          );
        }
      }
      return <Text>loading...</Text>;
    },
  });

export {
  Link,
  Prompt,
  Redirect,
  Route,
  Router,
  MemoryRouter,
  Switch,
  BackButton,
  AndroidBackButton,
  matchPath,
  withRouter,
  useHistory,
  useLocation,
  useParams,
  useRouteMatch,
} from 'react-router-native';

export {
  __RouterContext,
  createBrowserHistory,
  createHashHistory,
  createMemoryHistory,
  Plugin,
  ApplyPluginsType,
} from '{{{ umiRuntimePath }}}';

`;

export default (api: IApi) => {
  const {
    utils: { resolve, Mustache, winPath },
    paths: { absTmpPath },
  } = api;

  function detectUmiRuntimePath(): string {
    try {
      return resolve.sync('@umijs/runtime/dist/index.esm.js', { basedir: absTmpPath });
    } catch (ignored) {}
    try {
      const basedir = dirname(resolve.sync('@umijs/preset-built-in/package.json', { basedir: process.env.UMI_DIR }));
      return resolve.sync('@umijs/runtime/dist/index.esm.js', { basedir });
    } catch (ignored) {}
    try {
      return resolve.sync('@umijs/runtime/dist/index.esm.js', { basedir: process.env.UMI_DIR });
    } catch (ignored) {}
    return require.resolve('@umijs/runtime/dist/index.esm.js');
  }

  api.onGenerateFiles(async () => {
    api.writeTmpFile({
      path: 'rn/runtime.js',
      content: Mustache.render(CONTENT, {
        umiRuntimePath: winPath(detectUmiRuntimePath()),
      }),
    });
  });
};
