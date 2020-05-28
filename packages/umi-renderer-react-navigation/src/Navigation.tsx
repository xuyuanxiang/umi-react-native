import React, { ComponentType, useEffect } from 'react';
import { View, Text } from 'react-native';
import {
  ApplyPluginsType,
  Plugin,
  History,
  Redirect,
  __RouterContext as RouterContext,
  matchPath,
  IRouteProps,
  IRouteComponentProps,
} from 'umi';
import { matchRoutes } from 'react-router-config';
import { Route, NavigationHelpers } from '@react-navigation/native';
import urlJoin from 'url-join';
import { nanoid } from 'nanoid/non-secure';
import { createHistoryNavigator } from './createHistoryNavigator';

const { Navigator, Screen } = createHistoryNavigator();

interface INavigationProps {
  routes: IRouteProps[];
  plugin: Plugin;
  history: History<any>;
  defaultTitle?: string;
  extraProps?: object;
  initialRouteName?: string;
  initialParams?: object;
  [key: string]: any;
}

interface IScreen {
  key: string;
  name: string;
  component: ComponentType<any>;
  options: {
    routeMatchOpts: IRouteProps;
    sensitive?: boolean;
    title?: string;
    [key: string]: any;
  };
}

export interface IScreenComponentProps extends IRouteComponentProps {
  screen: Route<any>;
  navigation: NavigationHelpers<any, any>;
}

export function Navigation(props: INavigationProps) {
  const {
    history,
    plugin,
    initialRouteName = '/',
    initialParams = {},
    routes,
    defaultTitle,
    extraProps = {},
    ...rests
  } = props;

  useEffect(() => {
    function routeChangeHandler(location: any, action?: string) {
      const matchedRoutes = matchRoutes(props.routes, location.pathname);

      plugin.applyPlugins({
        key: 'onRouteChange',
        type: ApplyPluginsType.event,
        args: {
          routes: props.routes,
          matchedRoutes,
          location,
          action,
        },
      });
    }
    routeChangeHandler(history.location, 'POP');
    return history.listen(routeChangeHandler);
  }, [history]);

  if (__DEV__) {
    if (!Array.isArray(routes) || routes.length === 0) {
      return (
        <Navigator initialRouteName={initialRouteName} history={history}>
          <Screen
            name={initialRouteName}
            component={() => (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontWeight: 'bold', fontSize: 17, color: '#f4333c' }}>404</Text>
                <Text style={{ fontSize: 14, color: '#f4333c' }}>请在 pages/ 目录下实现一个 index 页面。</Text>
              </View>
            )}
          />
        </Navigator>
      );
    }
  }

  const initialMatch = {
    path: initialRouteName,
    params: initialParams,
    isExact: true,
    url: initialRouteName,
  };

  function renderRoutes(routes?: IRouteProps[], parent?: IRouteProps) {
    const results: JSX.Element[] = [];
    if (routes && routes.length > 0) {
      for (const route of routes) {
        const {
          key: routeKey,
          path,
          exact,
          component,
          strict,
          redirect,
          wrappers,
          title,
          routes: children,
          ...options
        } = route;
        const name = parent && parent.path ? urlJoin(parent.path, path || '/') : path || '/';
        results.push(
          <Screen key={routeKey || nanoid()} name={name} options={{ ...options, title: title || defaultTitle }}>
            {(props) => {
              const context = {
                history,
                location: history.location,
                match: matchPath(history.location.pathname, route) || initialMatch,
              };

              if (redirect) {
                return (
                  <RouterContext.Provider value={context}>
                    <Redirect from={path} to={redirect} exact={exact} strict={strict} />
                  </RouterContext.Provider>
                );
              }

              if (Array.isArray(children) && children.length > 0) {
                if (__DEV__) {
                  console.info('nested navigator:', route);
                }
                return (
                  <RouterContext.Provider value={context}>
                    <Navigator history={history}>{renderRoutes(children, route)}</Navigator>
                  </RouterContext.Provider>
                );
              }

              const newProps = {
                ...rests,
                ...extraProps,
                ...context,
                ...props,
              };

              const child = component ? React.createElement(component, newProps) : null;
              let el = parent && parent.component ? React.createElement(parent.component, props, child) : child;
              if (Array.isArray(wrappers)) {
                let len = wrappers.length - 1;
                while (len >= 0) {
                  el = React.createElement(wrappers[len], newProps, el);
                  len -= 1;
                }
              }
              return React.createElement(RouterContext.Provider, { value: context }, el);
            }}
          </Screen>,
        );
      }
    }
    return results;
  }

  function renderRoute(route: IRouteProps) {
    if (Array.isArray(route.routes) && route.routes.length > 0) {
      return <Navigator history={history}>{renderRoutes(route.routes, route)}</Navigator>;
    } else {

    }
  }

  if (__DEV__) {
    console.info('Navigation render');
  }
  return <>{renderRoutes(routes)}</>;
}
