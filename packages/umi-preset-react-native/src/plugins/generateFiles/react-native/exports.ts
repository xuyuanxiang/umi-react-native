import { IApi } from 'umi';

const TEMPLATE = `{{#dynamicImport}}
import Multibundle from 'umi-react-native-multibundle';

export async function dynamicImportBundle(bundleName: string) {
  await Multibundle.loadBundle(bundleName);
  return Multibundle.getBundleExport(bundleName);
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
