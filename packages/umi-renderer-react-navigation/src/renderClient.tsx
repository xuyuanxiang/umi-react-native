import React, { ComponentType, useEffect } from 'react';
import { ApplyPluginsType, Plugin } from 'umi';
import { __RouterContext as RouterContext, matchPath, RouteProps } from 'react-router';
import { matchRoutes } from 'react-router-config';
import { NavigationContainer, NavigationState } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import urlJoin from 'url-join';
import md5 from 'blueimp-md5';
import { IRoute } from './shared';

interface IRouterComponentProps {
  routes: IRoute[];
  plugin: Plugin;
  history: any;
  ssrProps?: object;
  defaultTitle?: string;
  extraProps?: object;
  [key: string]: any;
}

interface IOpts extends IRouterComponentProps {
  rootElement?: string | HTMLElement;
}

const { Navigator, Screen } = createStackNavigator();

interface IScreen {
  key: string;
  name: string;
  component: ComponentType<any>;
  options: {
    routeMatchOpts: RouteProps;
    redirect?: string;
    wrappers?: unknown[];
    [key: string]: any;
  };
}

function flattenRoutes(routes?: IRoute[], parent?: IScreen): IScreen[] {
  if (!Array.isArray(routes)) return [];
  const screens: IScreen[] = [];
  for (let idx = 0; idx < routes.length; idx++) {
    const route = routes[idx];
    const { path, exact, component, strict, sensitive, ...options } = route;
    if (!component) continue;
    const name = parent ? urlJoin(parent.name, path || '/') : path || '/';
    const screen: IScreen = {
      key: `s_${md5(name)}`,
      name,
      component: (props) =>
        parent && parent.component
          ? React.createElement(parent.component, props, React.createElement(component, props))
          : React.createElement(component, props),
      options: {
        ...options,
        routeMatchOpts: { exact, strict, sensitive, path },
      },
    };
    if (Array.isArray(route.routes) && route.routes.length > 0) {
      screens.push(...flattenRoutes(route.routes, screen));
    } else {
      screens.push(screen);
    }
  }
  return screens;
}

function RouterComponent(props: IRouterComponentProps) {
  const { history, plugin, routes, defaultTitle, ssrProps = {}, extraProps = {}, ...rests } = props;

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
    console.info('ssrProps:', ssrProps);
    console.info('others:', rests);
    console.info('screens:', screens);
  }

  const context = {
    history,
    location: history.location,
    match: { path: '/', params: {}, isExact: true, url: '/' },
  };

  return (
    <NavigationContainer {...extraProps} {...rests}>
      <RouterContext.Provider value={context}>
        <Navigator initialRouteName="/">
          {screens.map(({ key, component, options, ...rest }, idx) => (
            <Screen
              {...rest}
              key={key || `screen_${idx}`}
              options={{ ...options, title: options.title || defaultTitle }}
            >
              {({ route: screen = {}, ...props }) => {
                const match = matchPath(history.location.pathname, options.routeMatchOpts) || context.match;
                const newProps = {
                  ...rests,
                  ...ssrProps,
                  ...extraProps,
                  history,
                  location: history.location,
                  match,
                  screen,
                  ...props,
                };
                return React.createElement(component, newProps);
              }}
            </Screen>
          ))}
        </Navigator>
      </RouterContext.Provider>
    </NavigationContainer>
  );
}

export async function renderClient({ history, defaultTitle, plugin, routes, ssrProps = {}, extraProps = {} }: IOpts) {
  const initialState = await plugin.applyPlugins({
    key: 'getReactNavigationInitialState',
    type: ApplyPluginsType.modify,
    async: true,
  });
  if (__DEV__) {
    console.info('renderClient#getReactNavigationInitialState:', initialState);
  }
  function onStateChange(state?: NavigationState): void {
    if (__DEV__) {
      console.info('RouterComponent#onReactNavigationStateChange:', state);
    }
    plugin.applyPlugins({
      key: 'onReactNavigationStateChange',
      type: ApplyPluginsType.event,
      args: { state },
      async: true,
    });
  }
  return plugin.applyPlugins({
    type: ApplyPluginsType.modify,
    key: 'rootContainer',
    initialValue: (
      <RouterComponent
        history={history}
        defaultTitle={defaultTitle}
        plugin={plugin}
        routes={routes}
        ssrProps={ssrProps}
        extraProps={extraProps}
        initialState={initialState}
        onStateChange={onStateChange}
      />
    ),
    args: {
      history,
      routes,
      plugin,
    },
  });
}
