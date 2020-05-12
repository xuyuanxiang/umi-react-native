import { IApi } from 'umi';

const TEMPLATE = `import createNavigator from './createNavigator';

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

`;

export default (api: IApi) => {
  const {
    utils: { Mustache, lodash },
  } = api;
  api.onGenerateFiles(() => {
    api.writeTmpFile({
      path: 'react-navigation/renderer.ts',
      content: Mustache.render(TEMPLATE, {
        importSpecifier: `create${lodash.capitalize(lodash.camelCase(api.config?.reactNavigation?.type))}Navigator`,
        source: `@react-navigation/${api.config?.reactNavigation?.type}`,
      }),
    });
  });
};
