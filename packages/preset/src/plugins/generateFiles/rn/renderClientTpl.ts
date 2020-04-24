export default `import React, { useEffect } from 'react';
import { ApplyPluginsType, Plugin, Router } from '{{{ runtimePath }}}';
import { IRoute, renderRoutes } from '{{{ rendererPath }}}';
import { matchRoutes } from 'react-router-config';

interface IRouterComponentProps {
  routes: IRoute[];
  plugin: Plugin;
  history: any;
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

export function renderClient({ plugin, history, routes }: IRouterComponentProps) {
  return plugin.applyPlugins({
    type: ApplyPluginsType.modify,
    key: 'rootContainer',
    initialValue: <RouterComponent history={history} routes={routes} plugin={plugin} />,
    args: {
      history,
      routes,
      plugin,
    },
  });
}

`;
