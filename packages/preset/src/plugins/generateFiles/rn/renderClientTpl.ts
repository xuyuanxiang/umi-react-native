export default `import React, {useEffect} from 'react';
import {matchRoutes} from 'react-router-config';
import {Route, Router} from 'react-router-native';

function renderRoutes(routes) {
  if (Array.isArray(routes)) {
    return routes.map(({routes, ...props}) => {
      if (Array.isArray(routes)) {
        return (
          <Route
            key={props.path}
            {...props}
            component={() => (
              <props.component>{renderRoutes(routes)}</props.component>
            )}
          />
        );
      } else {
        return <Route key={props.path} {...props} />;
      }
    });
  }
  return null;
}

function RouterComponent({history, plugin, routes}) {
  useEffect(() => {
    function routeChangeHandler(location, action) {
      const matchedRoutes = matchRoutes(routes, location.pathname);

      plugin.applyPlugins({
        key: 'onRouteChange',
        type: 'event',
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

export function renderClient({history, routes, plugin}) {
  return plugin.applyPlugins({
    type: 'modify',
    key: 'rootContainer',
    initialValue: (
      <RouterComponent history={history} routes={routes} plugin={plugin} />
    ),
    args: {
      history,
      routes,
      plugin,
    },
  });
}

`;
