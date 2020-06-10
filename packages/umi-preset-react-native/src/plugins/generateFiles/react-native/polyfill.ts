import { IApi } from 'umi';

const CONTENT = `// @ts-ignore
if (global.window === undefined) {
  // @ts-ignore
  global.window = global;
}

`;

export default (api: IApi) => {
  //  @umijs/preset-built-in 的 polyfill 无法拆除
  //  RN 不需要 @babel/polyfill，故这里通过 alias 替换 @umijs/preset-built-in 添加的 polyfill
  // api.addPolyfillImports(() => [
  //   {
  //     source: './react-native/polyfill',
  //   },
  // ]);
  api.chainWebpack((memo) => {
    memo.resolve.alias.set('./core/polyfill', './react-native/polyfill');
    return memo;
  });

  api.addEntryCodeAhead(() => {
    if (api.config.define && typeof api.config.define === 'object') {
      const keys = Object.keys(api.config.define);
      return keys
        .map((key) => `global['${key}'] = ${JSON.stringify(api.config.define && api.config.define[key])};`)
        .join('\n');
    }
    return '';
  });

  api.addEntryCode(
    () => `// @ts-ignore
let accept: unknown;
// @ts-ignore
if (module.hot) {
  // @ts-ignore
  if (!accept) {
    // @ts-ignore
    accept = module.hot.accept;
  }
  // @ts-ignore
  module.hot.accept = function (path, fn) {
    if (typeof path === 'function' && typeof accept === 'function') {
      accept(path);
    }
    if (typeof fn === 'function' && typeof accept === 'function') {
      accept(fn);
    }
  };
}
  `,
  );

  api.onGenerateFiles(() => {
    api.writeTmpFile({
      path: 'react-native/polyfill.ts',
      content: CONTENT,
    });
  });
};
