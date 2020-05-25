import { IApi, IRoute } from 'umi';
import getBundleNameFrom from '../../../generators/rn/getBundleNameFrom';

export default async function routesToJSON(api: IApi) {
  const {
    utils: { lodash, winPath },
    paths: { cwd },
  } = api;
  const SEPARATOR = '^^^';
  const EMPTY_PATH = '_';
  const routes = await api.getRoutes();

  // 因为要往 routes 里加无用的信息，所以必须 deep clone 一下，避免污染
  const clonedRoutes = lodash.cloneDeep(routes);

  if (api.config.dynamicImport) {
    patchRoutes(clonedRoutes);
  }

  function patchRoutes(routes: IRoute[]) {
    routes.forEach(patchRoute);
  }

  function patchRoute(route: IRoute) {
    if (route.component && !isFunctionComponent(route.component)) {
      const webpackChunkName = route.component
        .replace(new RegExp(`^${lastSlash(winPath(cwd || '/'))}`), '')
        .replace(/^.(\/|\\)/, '')
        .replace(/(\/|\\)/g, '__')
        .replace(/\.jsx?$/, '')
        .replace(/\.tsx?$/, '')
        .replace(/^src__/, '')
        .replace(/\.\.__/g, '')
        // 约定式路由的 [ 会导致 webpack 的 code splitting 失败
        // ref: https://github.com/umijs/umi/issues/4155
        // eslint-disable-next-line no-useless-escape
        .replace(/[\[\]]/g, '')
        // 插件层的文件也可能是路由组件，比如 plugin-layout 插件
        .replace(/^.umi-production__/, 't__')
        .replace(/^pages__/, 'p__')
        .replace(/^page__/, 'p__');
      route.component = [route.component, webpackChunkName, route.path || EMPTY_PATH].join(SEPARATOR);
    }
    if (route.routes) {
      patchRoutes(route.routes);
    }
  }

  function isFunctionComponent(component: string) {
    // eslint-disable-next-line no-useless-escape
    return /^\((.+)?\)(\s+)?=>/.test(component) || /^function([^\(]+)?\(([^\)]+)?\)([^{]+)?{/.test(component);
  }

  function replacer(key: string, value: any) {
    switch (key) {
      case 'component':
        if (isFunctionComponent(value)) return value;
        if (api.config.dynamicImport) {
          const [component] = value.split(SEPARATOR);
          const bundleName = getBundleNameFrom(component);
          let loading = '';
          if (api.config.dynamicImport.loading) {
            loading = `,loading: require('${api.config.dynamicImport.loading}').default`;
          }
          return `dynamic({
          loader: async () => {
            await Multibundle.loadBundle('${bundleName}');
            return Multibundle.getBundleExport('${bundleName}');
          }${loading}})`;
        } else {
          return `require('${value}').default`;
        }
      case 'wrappers':
        // eslint-disable-next-line no-case-declarations
        const wrappers = value.map((wrapper: string) => {
          return `require('${wrapper}').default`;
        });
        return `[${wrappers.join(', ')}]`;
      default:
        return value;
    }
  }

  return (
    JSON.stringify(clonedRoutes, replacer, 2)
      // eslint-disable-next-line no-useless-escape
      .replace(/\"component\": (\"(.+?)\")/g, (global, m1, m2) => {
        return `"component": ${m2.replace(/\^/g, '"')}`;
      })
      // eslint-disable-next-line no-useless-escape
      .replace(/\"wrappers\": (\"(.+?)\")/g, (global, m1, m2) => {
        return `"wrappers": ${m2.replace(/\^/g, '"')}`;
      })
      .replace(/\\r\\n/g, '\r\n')
      .replace(/\\n/g, '\r\n')
  );

  function lastSlash(str: string) {
    return str[str.length - 1] === '/' ? str : `${str}/`;
  }
}
