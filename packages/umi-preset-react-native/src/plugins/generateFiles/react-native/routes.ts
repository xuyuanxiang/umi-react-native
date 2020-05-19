import { IApi } from 'umi';
import { createFormatter, routesToJSON } from '../../../utils';

const ROUTES_TPL = `import {ApplyPluginsType, dynamic} from 'umi';
import Multibundle from 'umi-preset-react-native';
import { plugin } from '@@/core/plugin';

const routes = {{#routes}}{{{ routes }}}{{/routes}}{{^routes}}{}{{/routes}};

plugin.applyPlugins({
  key: 'patchRoutes',
  type: ApplyPluginsType.event,
  args: { routes },
});

export { routes };

`;

export default (api: IApi) => {
  api.chainWebpack((memo) => {
    if (api.config.dynamicImport && api.config.dynamicImport.loading) {
      memo.resolve.alias.set('./core/routes', './react-native/routes');
      memo.resolve.alias.set('@@/core/routes', '@@/react-native/routes');
    }
    return memo;
  });

  api.onGenerateFiles(async () => {
    if (api.config.dynamicImport && api.config.dynamicImport.loading) {
      api.writeTmpFile({
        path: 'react-native/routes.ts',
        content: createFormatter(api)(
          api.utils.Mustache.render(ROUTES_TPL, {
            routes: await routesToJSON(api),
          }),
        ),
      });
    }
  });
};
