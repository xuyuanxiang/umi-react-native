import React, { useEffect, ReactElement } from 'react';
import { AppRegistry } from 'react-native';
import { ApplyPluginsType, Plugin } from '@umijs/runtime';
import { IRoute, renderRoutes } from '@umijs/renderer-react';
import { Router } from 'umi-runtime-react-native';
import { matchRoutes } from 'react-router-config';

interface IRouterComponentProps {
  routes: IRoute[];
  plugin: Plugin;
  history: any;
  ssrProps?: object;
  defaultTitle?: string;
}

interface IOpts extends IRouterComponentProps {
  rootElement?: string | HTMLElement;
  appKey: string;
}

function RouterComponent(props: IRouterComponentProps): JSX.Element {
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

export default function renderClient({ plugin, appKey, history, routes }: IOpts) {
  const rootContainer = plugin.applyPlugins({
    type: ApplyPluginsType.modify,
    key: 'rootContainer',
    initialValue: <RouterComponent history={history} routes={routes} plugin={plugin} />,
    args: {
      history,
      routes,
      plugin,
    },
  }) as ReactElement;
  AppRegistry.registerComponent(appKey, () => () => rootContainer);
  return rootContainer;
}
