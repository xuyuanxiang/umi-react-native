/* eslint-disable */
declare module 'umi' {
  export * from '@umijs/runtime';
  export * from '@umijs/types';
}

declare module '@umijs/preset-built-in/lib/plugins/commands/generateFiles' {
  import { IApi } from '@umijs/types';
  export default function (arg: { api: IApi; watch?: boolean }): Promise<() => void>;
}

declare module '@umijs/preset-built-in/lib/plugins/commands/dev/watchPkg' {
  export function watchPkg(opts: { cwd: string; onChange: Function }): () => void;
}
