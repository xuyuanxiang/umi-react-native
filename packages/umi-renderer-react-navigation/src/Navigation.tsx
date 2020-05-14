import React, { ComponentType, useEffect } from 'react';
import { ApplyPluginsType, Plugin, History, Redirect, __RouterContext as RouterContext, matchPath } from 'umi';
import { IRoute, IRouteComponentProps } from '@umijs/renderer-react';
import { matchRoutes } from 'react-router-config';
import { Route, NavigationHelpers } from '@react-navigation/native';
import urlJoin from 'url-join';
import md5 from 'blueimp-md5';
import { createHistoryNavigator } from './createHistoryNavigator';

const { Navigator, Screen } = createHistoryNavigator();

interface INavigationProps {
  routes: IRoute[];
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
    routeMatchOpts: IRoute;
    sensitive?: boolean;
    title?: string;
    [key: string]: any;
  };
}

export interface IScreenComponentProps extends IRouteComponentProps {
  screen: Route<any>;
  navigation: NavigationHelpers<any, any>;
}

function flattenRoutes(routes?: IRoute[], parent?: IScreen): IScreen[] {
  if (!Array.isArray(routes)) return [];
  const screens: IScreen[] = [];
  for (let idx = 0; idx < routes.length; idx++) {
    const route = routes[idx];
    const {
      key: routeKey,
      path,
      exact,
      component: Component,
      strict,
      redirect,
      wrappers,
      routes: children,
      ...options
    } = route;
    const name = parent && parent.name ? urlJoin(parent.name, path || '/') : path || '/';
    const screenKey = routeKey || `s_${md5(name)}`;
    const screen: IScreen = {
      key: screenKey,
      name,
      component: function ScreenComponent(props) {
        let children;
        if (redirect) {
          children = <Redirect from={path} to={redirect} exact={exact} strict={strict} />;
        } else {
          children = Component ? <Component {...props} /> : <React.Fragment {...props} />;
        }
        const Layout = parent?.component || null;
        // if (Array.isArray(wrappers)) {
        //   let len = wrappers.length - 1;
        //   while (len >= 0) {
        //     wrapper = React.createElement(wrappers[len], props, wrapper);
        //     len -= 1;
        //   }
        // }
        return Layout ? <Layout>{children}</Layout> : children;
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
    console.info('extraProps:', extraProps);
    console.info('otherProps:', rests);
    console.info('screens:', screens);
  }

  const context = {
    history,
    location: history.location,
    match: { path: '/', params: {}, isExact: true, url: '/' },
  };

  return (
    <RouterContext.Provider value={context}>
      <Navigator initialRouteName="/" history={history}>
        {screens.map(({ key, component: Component, options: { routeMatchOpts, title, ...options }, ...rest }, idx) => (
          <Screen {...rest} key={key || `screen_${idx}`} options={{ ...options, title: title || defaultTitle }}>
            {({ route: screen, ...props }) => {
              const match = matchPath(history.location.pathname, routeMatchOpts) || context.match;
              const newProps = {
                ...rests,
                ...extraProps,
                history,
                location: history.location,
                route: routeMatchOpts,
                match,
                screen, // 避免和 umi 约定注入的 route 命名冲突，这里将 react-navigation 注入的 route 更换为 screen。
                ...props,
              };
              return <Component {...newProps} />;
            }}
          </Screen>
        ))}
      </Navigator>
    </RouterContext.Provider>
  );
}
