import React, { ComponentType, useEffect } from 'react';
import { join, sep } from 'path';
import { platform } from 'os';
import { ApplyPluginsType, Plugin } from 'umi';
import { Router } from 'react-router';
import { matchRoutes } from 'react-router-config';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { IRoute } from './shared';

const PLATFORM = platform();

interface IRouterComponentProps {
  routes: IRoute[];
  plugin: Plugin;
  history: any;
  ssrProps?: object;
  defaultTitle?: string;
}

interface IOpts extends IRouterComponentProps {
  rootElement?: string | HTMLElement;
}

const { Navigator, Screen } = createStackNavigator();

interface IScreen {
  key: string;
  name: string;
  component: ComponentType<any>;
  options: any;
  exact?: boolean;
  redirect?: string;
  strict?: boolean;
  sensitive?: boolean;
  wrappers?: any[];
}

function flattenRoutes(routes: IRoute[], parent?: IScreen): IScreen[] {
  const screens: IScreen[] = [];
  for (let idx = 0; idx < routes.length; idx++) {
    const { path, exact, redirect, component, routes: children, strict, sensitive, wrappers, ...options } = routes[idx];
    if (!component || !path) continue;
    const name = join(parent && parent.name ? parent.name : '', path);
    const screen: IScreen = {
      key: parent ? `${parent.key}_${idx}` : `screen_${idx}`,
      name: PLATFORM === 'win32' ? name.replace(sep, '/') : name,
      component,
      options,
      exact,
      redirect,
      strict,
      sensitive,
      wrappers,
    };
    if (!children || children.length === 0) {
      screens.push(screen);
    } else {
      screens.push(...flattenRoutes(children, screen));
    }
  }
  return screens;
}

function RouterComponent(props: IRouterComponentProps) {
  const { history } = props;

  useEffect(() => {
    function routeChangeHandler(location: any, action?: string) {
      const matchedRoutes = matchRoutes(props.routes, location.pathname);

      props.plugin.applyPlugins({
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

  return (
    <NavigationContainer>
      <Router history={history}>
        <Navigator>
          {flattenRoutes(props.routes).map(({ key, options, ...rest }, idx) => (
            <Screen
              {...rest}
              key={key || `screen_${idx}`}
              options={{ ...options, title: options.title || props.defaultTitle }}
            />
          ))}
        </Navigator>
      </Router>
    </NavigationContainer>
  );
}

export function renderClient(opts: IOpts) {
  return opts.plugin.applyPlugins({
    type: ApplyPluginsType.modify,
    key: 'rootContainer',
    initialValue: <RouterComponent {...opts} />,
    args: {
      history: opts.history,
      routes: opts.routes,
      plugin: opts.plugin,
    },
  });
}
