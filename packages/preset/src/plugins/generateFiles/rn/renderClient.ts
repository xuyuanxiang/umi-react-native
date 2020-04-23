import { IApi } from '@umijs/types';
import { dirname } from 'path';
import renderClientTpl from './renderClientTpl';

export default (api: IApi) => {
  const {
    utils: { Mustache, winPath },
  } = api;

  api.onGenerateFiles(async () => {
    // const rendererPath = await api.applyPlugins({
    //   key: 'modifyRendererPath',
    //   type: api.ApplyPluginsType.modify,
    //   initialValue: require.resolve('@umijs/renderer-react'),
    // });
    api.writeTmpFile({
      path: 'rn/renderClient.tsx',
      content: Mustache.render(renderClientTpl, {
        // runtimePath: winPath(dirname(require.resolve('@umijs/runtime/package.json'))),
        // rendererPath: winPath(rendererPath),
        // reactRouterConfigPath: winPath(dirname(require.resolve('react-router-config/package.json'))),
      }),
    });
  });
};
