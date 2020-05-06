/**
 * @file 防止加载umi包 Common JS格式的代码
 * @description umi for WEB 使用webpack treeShaking，运行时加载的是ES Module格式的代码：umi/dist/index.esm.js，没问题。
 * 但 RN 中 无论 haul 还是 metro，都没有treeShaking，会加载umi Common JS代码：umi/index.js，其中包含了大量 Node 工具类库。
 * 在 haul 构建时甚至会导致Out of memory。
 */
import { IApi } from '@umijs/types';
import { dirname } from 'path';

const CONTENT = `export {
  Link,
  Link as NavLink,
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
  match,
  useLocation,
  useParams,
  useRouteMatch,
} from 'react-router-native';

export {
  Plugin,
  ApplyPluginsType,
  createBrowserHistory,
  createHashHistory,
  createMemoryHistory
} from '{{{ umiRuntimePath }}}';

export * from '../core/umiExports';

`;

export default (api: IApi) => {
  const {
    utils: { resolve, Mustache },
  } = api;

  function detectUmiRuntimeDirs(): string {
    let result: string | undefined;
    try {
      const basedir = dirname(resolve.sync('@umijs/preset-built-in/package.json', { basedir: process.env.UMI_DIR }));
      result = dirname(resolve.sync('@umijs/runtime/package.json', { basedir }));
    } catch (ignored) {}
    if (!result) {
      result = dirname(resolve.sync('@umijs/runtime/package.json', { basedir: process.env.UMI_DIR }));
    }
    return result || '@umijs/runtime';
  }

  api.onGenerateFiles(() => {
    api.writeTmpFile({
      path: 'react-native/umi.ts',
      content: Mustache.render(CONTENT, {
        umiRuntimePath: detectUmiRuntimeDirs(),
      }),
    });
  });
};
