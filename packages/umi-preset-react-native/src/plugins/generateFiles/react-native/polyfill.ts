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

  api.onGenerateFiles(() => {
    api.writeTmpFile({
      path: 'react-native/polyfill.ts',
      content: CONTENT,
    });
  });
};
