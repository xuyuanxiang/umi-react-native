/**
 * @file 防止加载umi包 Common JS格式的代码
 * @description umi for WEB 使用webpack treeShaking，运行时加载的是ES Module格式的代码：umi/dist/index.esm.js，没问题。
 * 但 RN 中 无论 haul 还是 metro，都没有treeShaking，会加载umi Common JS代码：umi/index.js，其中包含了大量 Node 工具类库。
 * 在 haul 构建时甚至会导致Out of memory。
 */
import { IApi } from '@umijs/types';

const CONTENT = `export * from 'umi-react-native-runtime';
export * from '../core/umiExports';

`;

export default (api: IApi) => {
  api.onGenerateFiles(() => {
    api.writeTmpFile({
      path: 'react-native/umi.ts',
      content: CONTENT,
    });
  });
};
