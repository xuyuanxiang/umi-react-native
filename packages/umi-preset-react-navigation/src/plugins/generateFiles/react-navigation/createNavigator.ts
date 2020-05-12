import { IApi } from 'umi';

const TEMPLATE = `import { {{{ importSpecifier }}} } from '{{{ source }}}';

export default {{{ importSpecifier }}};

`;

export default (api: IApi) => {
  const {
    utils: { Mustache, lodash },
  } = api;
  api.onGenerateFiles(() => {
    api.writeTmpFile({
      path: 'react-navigation/createNavigator.ts',
      content: Mustache.render(TEMPLATE, {
        importSpecifier: `create${lodash.capitalize(lodash.camelCase(api.config?.reactNavigation?.type))}Navigator`,
        source: `@react-navigation/${api.config?.reactNavigation?.type}`,
      }),
    });
  });
};
