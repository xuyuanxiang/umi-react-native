import React, { useEffect } from 'react';
import { AppRegistry } from 'react-native';
import { ApplyPluginsType, Plugin, Router } from 'umi-react-native-runtime';
import { matchRoutes } from 'react-router-config';
import { IRoute } from '..';
import renderRoutes from '../renderRoutes/renderRoutes';

interface IRouterComponentProps {
  routes: IRoute[];
  plugin: Plugin;
  history: any;
}

interface IOpts extends IRouterComponentProps {
  appKey: string;
}

function RouterComponent(props: IRouterComponentProps) {
  const { history, ...renderRoutesProps } = props;

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

  return <Router history={history}>{renderRoutes(renderRoutesProps)}</Router>;
}

export default function renderClient(opts: IOpts) {
  const rootContainer = opts.plugin.applyPlugins({
    type: ApplyPluginsType.modify,
    key: 'rootContainer',
    initialValue: <RouterComponent history={opts.history} routes={opts.routes} plugin={opts.plugin} />,
    args: {
      history: opts.history,
      routes: opts.routes,
      plugin: opts.plugin,
    },
  });
  AppRegistry.registerComponent(opts.appKey, rootContainer);
  return rootContainer;
}
