import { IApi } from 'umi';

const TEMPLATE = `import { NavigationContainer } from '@react-navigation/native';
import createNavigator from './react-navigation/createNavigator';

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
