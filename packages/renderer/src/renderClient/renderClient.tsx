import React, { useEffect } from 'react';
import { ApplyPluginsType, Plugin, NativeRouter } from 'umi-react-native-runtime';
// import { matchRoutes } from 'react-router-config';
import { IRoute } from '../IRoute';
import renderRoutes from '../renderRoutes/renderRoutes';

interface IRouterComponentProps {
  routes: IRoute[];
  plugin: Plugin;
}

interface IOpts extends IRouterComponentProps {
  rootElement?: string | HTMLElement;
}

function RouterComponent(props: IRouterComponentProps) {
  useEffect(() => {
    // function routeChangeHandler(location: any, action?: string) {
    //   const matchedRoutes = matchRoutes(props.routes, location.pathname);
    //
    //   props.plugin.applyPlugins({
    //     key: 'onRouteChange',
    //     type: ApplyPluginsType.event,
    //     args: {
    //       routes: props.routes,
    //       matchedRoutes,
    //       location,
    //       action,
    //     },
    //   });
    // }
    // routeChangeHandler(history.location, 'POP');
    // return history.listen(routeChangeHandler);
  }, [history]);

  return <NativeRouter>{renderRoutes(props)}</NativeRouter>;
}

export default function renderClient(opts: IOpts) {
  const rootContainer = opts.plugin.applyPlugins({
    type: ApplyPluginsType.modify,
    key: 'rootContainer',
    initialValue: <RouterComponent routes={opts.routes} plugin={opts.plugin} />,
    args: {
      routes: opts.routes,
      plugin: opts.plugin,
    },
  });

  return rootContainer;
}
