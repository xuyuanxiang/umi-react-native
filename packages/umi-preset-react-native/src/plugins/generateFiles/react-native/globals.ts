import { IApi } from 'umi';

const TPL = `{{{ globals }}}

`;

export default (api: IApi) => {
  const {
    utils: { Mustache, lodash },
  } = api;
  api.addPolyfillImports(() => {
    if (lodash.isPlainObject(api.config.define) && !lodash.isEmpty(api.config.define)) {
      return [
        {
          source: './react-native/globals',
        },
      ];
    }
    return [];
  });
  api.onGenerateFiles(() => {
    if (lodash.isPlainObject(api.config.define) && !lodash.isEmpty(api.config.define)) {
      api.writeTmpFile({
        path: 'react-native/globals.ts',
        content: Mustache.render(TPL, {
          globals: lodash
            .keysIn(api.config.define)
            .map(
              (key) =>
                `// @ts-ignore\nglobal['${key}'] = ${JSON.stringify(api.config.define && api.config.define[key])};`,
            )
            .join('\n'),
        }),
      });
    }
  });
};
