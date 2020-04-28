export default `import React, {useEffect} from 'react';
import {AppRegistry} from 'react-native';
import {matchRoutes} from 'react-router-config';
import {Route, Router} from 'react-router-native';
import {ApplyPluginsType} from 'umi-react-native-runtime';

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

export function renderClient({history, routes, plugin, appKey}) {
  const App = plugin.applyPlugins({
    type: ApplyPluginsType.modify,
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

  AppRegistry.registerComponent(appKey, () => () => App);

  return App;
}

`;
