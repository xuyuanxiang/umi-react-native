import React, { ComponentType, useEffect } from 'react';
import { join, sep } from 'path';
import { platform } from 'os';
import { IRoute } from './shared';
import { ApplyPluginsType, Plugin } from '@umijs/runtime';
import { matchRoutes } from 'react-router-config';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const PLATFORM = platform();

interface IRouterComponentProps {
  routes: IRoute[];
  plugin: Plugin;
  history: any;
  defaultTitle?: string;
  theme?: {
    dark?: boolean;
    colors?: {
      primary: string;
      background: string;
      card: string;
      text: string;
      border: string;
    };
  };
}

const { Navigator, Screen } = createStackNavigator();

interface IScreen {
  key: string;
  name: string;
  component: ComponentType<any>;
  options: any;
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
    };
    if (!children || children.length === 0) {
      screens.push(screen);
    } else {
      screens.push(...flattenRoutes(children, screen));
    }
  }
  return screens;
}

export function renderRoutes({ routes, defaultTitle = '' }: IRouterComponentProps): JSX.Element {
  return (
    <Navigator>
      {flattenRoutes(routes).map(({ key, options = {}, ...props }, idx) => (
        <Screen
          {...props}
          key={key || idx}
          options={{
            title: options.title || defaultTitle,
            ...options,
          }}
        />
      ))}
    </Navigator>
  );
}

function RouterComponent(props: IRouterComponentProps) {
  const { history, theme } = props;

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

  return <NavigationContainer theme={Object.assign(DefaultTheme, theme)}>{renderRoutes(props)}</NavigationContainer>;
}

export function renderer(opts: IRouterComponentProps) {
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
