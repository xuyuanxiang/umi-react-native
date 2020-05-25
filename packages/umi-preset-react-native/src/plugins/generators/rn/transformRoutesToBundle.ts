import { IRoute } from 'umi';
import IBundle from './IBundle';
import getBundleNameFrom from './getBundleNameFrom';

export default function transformRoutesToBundle(routes: IRoute[]): IBundle[] {
  const bundles: IBundle[] = [];
  for (const route of routes) {
    if (route.component) {
      bundles.push({
        name: getBundleNameFrom(route.component),
        entry: route.component,
        dependsOn: ['index'],
        app: true,
        // type: 'indexed-ram-bundle',
        transform: 'transform',
      });
    }
    if (Array.isArray(route.routes) && route.routes.length > 0) {
      bundles.push(...transformRoutesToBundle(route.routes));
    }
  }
  return bundles;
}
