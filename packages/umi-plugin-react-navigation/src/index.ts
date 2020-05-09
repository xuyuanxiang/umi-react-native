import { IApi, IRoute } from 'umi';
import { dirname } from 'path';
import { dependencies } from '../package.json';

const exportsTpl = `export * from '@react-navigation/stack';
export * from '@react-navigation/native';

`;
const screenWrapperTpl = `import {Screen} from 'react-native-screens';

export default (props) => {
   return <Screen>{ props.children }</Screen>;
}

`;
export default (api: IApi) => {
  api.describe({
    key: 'navigation',
    config: {
      default: {
        theme: null,
      },
      schema(joi) {
        return joi
          .object({
            theme: joi.object({
              dark: joi.boolean(),
              colors: joi.object({
                primary: joi.string(),
                background: joi.string(),
                card: joi.string(),
                text: joi.string(),
                border: joi.string(),
              }),
            }),
          })
          .optional();
      },
    },
  });

  api.addProjectFirstLibraries(() =>
    Object.keys(dependencies).map((name) => ({ name, path: dirname(require.resolve(`${name}/package.json`)) })),
  );

  api.addEntryImportsAhead(() => [{ source: 'react-native-gesture-handler' }]);
  api.addEntryImports(() => [
    {
      specifier: 'enableScreens',
      source: 'react-native-screens',
    },
  ]);
  api.addEntryCode(() => `enableScreens();`);

  api.modifyRendererPath(() => 'umi-renderer-react-navigation');

  api.addTmpGenerateWatcherPaths(() => ['react-navigation']);

  function addWrapper(routes: IRoute[]): IRoute[] {
    const results: IRoute[] = [];
    for (const route of routes) {
      if (Array.isArray(route.wrappers)) {
        route.wrappers.unshift('@@/react-navigation/screenWrapper');
      } else {
        route.wrappers = ['@@/react-navigation/screenWrapper'];
      }
      if (Array.isArray(route.routes)) {
        route.routes = addWrapper(route.routes);
      }
    }
    return results;
  }

  api.modifyRoutes((routes) => addWrapper(routes));

  api.onGenerateFiles(() => {
    api.writeTmpFile({
      path: 'react-navigation/exports.ts',
      content: exportsTpl,
    });
    api.writeTmpFile({
      path: 'react-navigation/screenWrapper.ts',
      content: screenWrapperTpl,
    });
  });

  api.addUmiExports(() => [
    {
      exportAll: true,
      source: '../react-navigation/exports',
    },
  ]);
};
