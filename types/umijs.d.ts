declare module '@umijs/preset-built-in/lib/plugins/commands/generateFiles' {
  import { IApi } from '@umijs/types';
  export default function (arg: { api: IApi; watch?: boolean }): Promise<() => void>;
}
