import React, { useEffect } from 'react';
import { AppRegistry } from 'react-native';
import { matchRoutes } from 'react-router-config';
import { ApplyPluginsType, Router, Plugin } from 'umi-react-native-runtime';
import { renderRoutes } from './renderRoutes';
import { IRoute } from './shared';

interface IRouterComponentProps {
  routes: IRoute[];
  plugin: Plugin;
  history: any;
}

interface IOpts extends IRouterComponentProps {
  appKey: string;
}

function RouterComponent({ history, plugin, routes }: IRouterComponentProps) {
  useEffect(() => {
    function routeChangeHandler(location: any, action?: string) {
      const matchedRoutes = matchRoutes(routes, location.pathname);

      plugin.applyPlugins({
        key: 'onRouteChange',
        type: ApplyPluginsType.event,
        args: {
          routes,
          matchedRoutes,
          location,
          action,
        },
      });
    }

    routeChangeHandler(history.location, 'POP');
    return history.listen(routeChangeHandler);
  }, [history, plugin, routes]);

  return <Router history={history}>{renderRoutes(routes)}</Router>;
}

export function renderClient({ history, routes, plugin, appKey }: IOpts) {
  const App = plugin.applyPlugins({
    type: ApplyPluginsType.modify,
    key: 'rootContainer',
    initialValue: <RouterComponent history={history} routes={routes} plugin={plugin} />,
    args: {
      history,
      routes,
      plugin,
    },
  });

  AppRegistry.registerComponent(appKey, () => () => App);

  return App;
}
