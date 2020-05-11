import React from 'react';
import { View, Text } from 'react-native';
import { dynamic as domDynamic } from '@umijs/runtime/dist/index.esm.js';

export const dynamic = (opts = {}) =>
  domDynamic({
    ...opts,
    loading({ error, isLoading }: { error: Error; isLoading: boolean }) {
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
} from '@umijs/runtime/dist/index.esm.js';
