import { IApi } from 'umi';
import IBundle from './IBundle';

export default function bundlesToJSON(api: IApi, bundles: IBundle[]): string {
  if (Array.isArray(bundles) && bundles.length > 0) {
    return JSON.stringify(
      api.utils.lodash
        .chain(bundles)
        .map(({ name, ...bundle }) => ({ [name]: bundle }))
        .reduce((prev, curr) => ({ ...prev, ...curr }))
        .value(),
    ).replace(/("transform"\s?:"transform")/g, (global, m1) => {
      return global.replace(m1, 'transform');
    });
  }
  return JSON.stringify({});
}
