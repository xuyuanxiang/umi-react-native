import { IApi } from 'umi';
import { dirname } from 'path';
import { getBundleAndConfigs } from '@umijs/preset-built-in/lib/plugins/commands/buildDevUtils';
import haulTpl from './haulTpl';

export default (api: IApi) => {
  const {
    utils: { Mustache, winPath, lodash },
  } = api;

  api.onGenerateFiles(async () => {
    const { bundleConfigs } = await getBundleAndConfigs({ api });
    const config = bundleConfigs.filter((bundleConfig: any) => {
      return bundleConfig.entry?.umi;
    })[0];
    const haulPresetPath =
      api.config?.reactNative?.version?.minor >= 60
        ? require.resolve('@haul-bundler/preset-0.60/package.json')
        : require.resolve('@haul-bundler/preset-0.59/package.json');
    api.writeTmpFile({
      path: 'haul.config.js',
      content: Mustache.render(haulTpl, {
        haulPresetPath: winPath(dirname(haulPresetPath)),
        alias: JSON.stringify(lodash.omit(config.resolve?.alias, ['react-dom', 'react-router-dom']), null, 2),
      }),
    });
  });
};
