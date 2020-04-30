export { dynamic } from './dynamic';
// RN 没有 treeShaking
export {
  Plugin,
  ApplyPluginsType,
  createBrowserHistory,
  createHashHistory,
  createMemoryHistory,
} from '@umijs/runtime/dist/index.esm';

/**
 * 可配置化，方便通过 alias 将 react-router-native 替换为 umi-react-native-navigation-shim。
 *
 * umi-react-native-navigation-shim 基于 react-navigation,
 * 使用 react-router-native API 包了一层。
 *
 * react-navigation 具备原生的体验效果。
 */
export {
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
