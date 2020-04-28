import React from 'react';
import { Route } from 'umi-react-native-runtime';
import { IRoute } from './shared';

export function renderRoutes(routes: IRoute[]) {
  if (Array.isArray(routes)) {
    return routes.map(({ routes, ...route }) => {
      if (Array.isArray(routes)) {
        const Container = route.component || React.Fragment;
        return (
          <Route
            key={route.key || route.path}
            {...route}
            component={() => <Container>{renderRoutes(routes)}</Container>}
          />
        );
      } else {
        return <Route key={route.key || route.path} {...route} />;
      }
    });
  }
  return null;
}
