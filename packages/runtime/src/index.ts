export {
  Link,
  Prompt,
  Redirect,
  Route,
  Router,
  NativeRouter,
  BackButton,
  AndroidBackButton,
  MemoryRouter,
  Switch,
  matchPath,
  withRouter,
  useHistory,
  useLocation,
  useParams,
  useRouteMatch,
} from 'react-router-native';
export { __RouterContext } from 'react-router';

export { createMemoryHistory } from 'history-with-query';

export function createBrowserHistory() {
  throw new TypeError(
    '在 react-native 只能使用 "memory" history。("history: browser" need a DOM, you can only use "memory" history in react-native.)',
  );
}

export function createHashHistory() {
  throw new TypeError(
    '在 react-native 只能使用 "memory" history。("history: hash" need a DOM, you can only use "memory" history in react-native.)',
  );
}

export { default as Plugin, ApplyPluginsType } from './Plugin/Plugin';

export function dynamic() {
  throw new TypeError('react-native 中不支持按需加载。("dynamicImport" was not supported in react-native)');
}
