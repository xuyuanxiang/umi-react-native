import React from 'react';
import { ApplyPluginsType, Plugin, IRouteProps } from 'umi';
import { Navigation } from './Navigation';

interface IRouterComponentProps {
  routes: IRouteProps[];
  plugin: Plugin;
  history: any;
  ssrProps?: object;
  defaultTitle?: string;
}

interface IOpts extends IRouterComponentProps {
  rootElement?: string | HTMLElement;
}

export function renderClient(opts: IOpts) {
  return opts.plugin.applyPlugins({
    type: ApplyPluginsType.modify,
    key: 'rootContainer',
    initialValue: (
      <Navigation history={opts.history} routes={opts.routes} plugin={opts.plugin} defaultTitle={opts.defaultTitle} />
    ),
    args: {
      history: opts.history,
      routes: opts.routes,
      plugin: opts.plugin,
    },
  });
}
