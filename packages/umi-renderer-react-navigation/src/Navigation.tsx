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
    const { key: routeKey, path, exact, component, strict, redirect, wrappers, routes: children, ...options } = route;
    const name = parent && parent.name ? urlJoin(parent.name, path || '/') : path || '/';
    const screenKey = routeKey || `s_${md5(name)}`;
    const screen: IScreen = {
      key: screenKey,
      name,
      component: function ScreenComponent(props) {
        if (redirect) {
          return <Redirect from={path} to={redirect} exact={exact} strict={strict} />;
        }
        const children = component ? React.createElement(component, props) : null;
        return parent && parent.component ? React.createElement(parent.component, props, children) : children;
        // if (Array.isArray(wrappers)) {
        //   let len = wrappers.length - 1;
        //   while (len >= 0) {
        //     wrapper = React.createElement(wrappers[len], props, wrapper);
        //     len -= 1;
        //   }
        // }
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
            {(props) => {
              const newProps = {
                ...rests,
                ...extraProps,
                ...props,
              };
              console.info('Screen:', Component);
              return (
                <RouterContext.Provider
                  value={{
                    ...context,
                    match: matchPath(history.location.pathname, routeMatchOpts) || context.match,
                  }}
                >
                  <Component {...newProps} />
                </RouterContext.Provider>
              );
            }}
          </Screen>
        ))}
      </Navigator>
    </RouterContext.Provider>
  );
}
