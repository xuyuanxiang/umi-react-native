import React, { ComponentType, useEffect } from 'react';
import { Text, View } from 'react-native';
import {
  __RouterContext as RouterContext,
  ApplyPluginsType,
  History,
  IRouteComponentProps,
  IRouteProps,
  matchPath,
  Plugin,
  Redirect,
} from 'umi';
import { matchRoutes } from 'react-router-config';
import { NavigationHelpers, Route } from '@react-navigation/native';
import { nanoid } from 'nanoid/non-secure';
import { createHistoryNavigator } from './createHistoryNavigator';

const { Navigator, Screen } = createHistoryNavigator();

interface INavigationProps {
  routes: IRouteProps[];
  plugin: Plugin;
  history: History<any>;
  defaultTitle?: string;
  extraProps?: object;
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

function flattenRoutes(routes?: IRouteProps[], parent?: IScreen): IScreen[] {
  if (!Array.isArray(routes)) return [];
  const screens: IScreen[] = [];
  for (let idx = 0; idx < routes.length; idx++) {
    const route = routes[idx];
    const { key: routeKey, path, exact, component, strict, redirect, wrappers, routes: children, ...options } = route;
    const screenKey = routeKey || nanoid();
    const screen: IScreen = {
      key: screenKey,
      name: path || '/',
      component: function ScreenComponent(props) {
        if (redirect) {
          return <Redirect from={path} to={redirect} exact={exact} strict={strict} />;
        }
        const children = component ? React.createElement(component, props) : null;
        return parent && parent.component ? React.createElement(parent.component, props, children) : children;
      },
      options: {
        ...options,
        routeMatchOpts: route,
      },
    };
    if (Array.isArray(children) && children.length > 0) {
      screens.push(...flattenRoutes(children, screen));
    } else {
      screens.push(screen);
    }
  }
  return screens;
}

export function Navigation(props: INavigationProps) {
  const { history, plugin, routes, defaultTitle, extraProps = {}, ...rests } = props;

  const initialRouteName = plugin.applyPlugins({
    key: 'getReactNavigationInitialRouteName',
    type: ApplyPluginsType.modify,
    initialValue: '/',
  });
  const screenOptions = plugin.applyPlugins({
    key: 'getReactNavigationDefaultScreenOptions',
    type: ApplyPluginsType.modify,
  });

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

  const screens = flattenRoutes(routes);

  if (__DEV__) {
    if (!screens || screens.length === 0) {
      return (
        <Navigator initialRouteName="notFound" history={history}>
          <Screen
            name="notFound"
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
    params: {},
    isExact: true,
    url: initialRouteName,
  };

  return (
    <Navigator initialRouteName={initialRouteName} history={history} screenOptions={screenOptions}>
      {screens.map(({ key, component: Component, options: { routeMatchOpts, title, ...options }, ...rest }, idx) => (
        <Screen
          {...rest}
          key={key || `screen_${idx}`}
          options={{
            ...options,
            title: title || defaultTitle,
          }}
        >
          {(props) => {
            const context = {
              history,
              location: history.location,
              match: matchPath(history.location.pathname, routeMatchOpts) || initialMatch,
            };
            const newProps = {
              ...rests,
              ...extraProps,
              ...context,
              ...props,
            };
            return (
              <RouterContext.Provider value={context}>
                <Component {...newProps} />
              </RouterContext.Provider>
            );
          }}
        </Screen>
      ))}
    </Navigator>
  );
}
