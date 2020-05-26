import { IApi } from 'umi';
import { createFormatter } from '../../../utils';
import routesToJSON from './routesToJSON';

const ROUTES_TPL = `import {ApplyPluginsType, dynamic} from 'umi';
import Multibundle from 'umi-react-native-multibundle';
import { plugin } from '@@/core/plugin';

const routes = {{#routes}}{{{ routes }}}{{/routes}}{{^routes}}{}{{/routes}};

plugin.applyPlugins({
  key: 'patchRoutes',
  type: ApplyPluginsType.event,
  args: { routes },
});

export { routes };

`;

/**
 * 在 RN 中启用 dynamicImport 时，会拆分多 bundle。
 * 这里需要重写，并使用 alias 替换 umi 生成的路由。
 */
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
