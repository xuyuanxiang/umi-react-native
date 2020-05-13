import { IApi } from 'umi';

const TEMPLATE = `import { {{{ importSpecifier }}} } from '{{{ source }}}';

export default {{{ importSpecifier }}};

`;

export default (api: IApi) => {
  const {
    utils: { Mustache, lodash },
  } = api;
  api.onGenerateFiles(() => {
    let importSpecifier: string;
    const type = api.config?.reactNavigation?.type || 'stack';
    if (type === 'bottom-tabs') {
      importSpecifier = 'createBottomTabNavigator';
    } else {
      importSpecifier = `create${lodash.upperFirst(lodash.camelCase(api.config?.reactNavigation?.type))}Navigator`;
    }
    api.writeTmpFile({
      path: 'react-navigation/createNavigator.ts',
      content: Mustache.render(TEMPLATE, {
        importSpecifier,
        source: `@react-navigation/${type}`,
      }),
    });
  });
};
