import { IApi } from 'umi';

const TEMPLATE = `{{#dynamicImport}}
import {dynamic} from 'umi';
import Multibundle from 'umi-react-native-multibundle';
import loading from './loading';

export function dynamicImportBundle(bundleName: string) {
  return dynamic({
    loader: async () => {
      await Multibundle.loadBundle(bundleName);
      return Multibundle.getBundleExport(bundleName);
    },
    loading,
  })
}

{{/dynamicImport}}
export {
  BackButton,
  AndroidBackButton,
} from 'react-router-native';

`;

export default (api: IApi) => {
  api.onGenerateFiles(() => {
    api.writeTmpFile({
      path: 'react-native/exports.ts',
      content: api.utils.Mustache.render(TEMPLATE, {
        dynamicImport: Boolean(api.config.dynamicImport),
        // publicPath: api.config.publicPath,
      }),
    });
  });
  api.addUmiExports(() => [
    {
      exportAll: true,
      source: '../react-native/exports',
    },
  ]);
};
