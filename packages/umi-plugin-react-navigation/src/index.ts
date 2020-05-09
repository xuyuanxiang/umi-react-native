import { IApi } from 'umi';
import { dirname } from 'path';
import { dependencies } from '../package.json';

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

  api.modifyRendererPath(() => 'umi-renderer-react-navigation');

  api.addTmpGenerateWatcherPaths(() => ['react-navigation']);

  api.onGenerateFiles(async () => {
    const exportsTpl = await import('./exportsTpl');
    api.writeTmpFile({
      path: 'react-navigation/exports.ts',
      content: exportsTpl.default,
    });
  });

  api.addUmiExports(() => [
    {
      exportAll: true,
      source: '../react-navigation/exports',
    },
  ]);
};
