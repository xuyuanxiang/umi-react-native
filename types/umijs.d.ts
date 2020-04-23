declare module '@umijs/preset-built-in/lib/plugins/commands/generateFiles' {
  import { IApi } from '@umijs/types';
  export default function (arg: { api: IApi; watch?: boolean }): Promise<() => void>;
}

declare module '@umijs/preset-built-in/lib/plugins/commands/buildDevUtils' {
  export function cleanTmpPathExceptCache(arg: { absTmpPath: string }): void;
}
declare module '@umijs/preset-built-in/lib/plugins/commands/dev/watchPkg' {
  export function watchPkg(opts: { cwd: string; onChange: Function }): () => void;
}
