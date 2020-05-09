/* eslint-disable */
declare module 'umi' {
  import * as utils from '@umijs/utils';
  export { utils };
  export * from '@umijs/types';
}
declare module '@umijs/runtime/dist/index.esm' {
  export * from '@umijs/runtime';
}
declare module '@umijs/preset-built-in/lib/plugins/commands/generateFiles' {
  import { IApi } from '@umijs/types';
  export default function (arg: { api: IApi; watch?: boolean }): Promise<() => void>;
}
declare module '@umijs/preset-built-in/lib/plugins/commands/buildDevUtils' {
  import { IApi } from '@umijs/types';
  import webpack, { Configuration } from 'webpack';

  enum ConfigType {
    csr = 'csr',
    ssr = 'ssr',
  }

  class Bundler {
    static id: string;
    static version: number;
    cwd: string;
    config: IConfig;
    constructor({ cwd, config }: IOpts);
    getConfig(opts: Omit<IGetConfigOpts, 'cwd' | 'config'>): Promise<defaultWebpack.Configuration>;
    build({
      bundleConfigs,
      bundleImplementor,
    }: {
      bundleConfigs: defaultWebpack.Configuration[];
      bundleImplementor?: typeof defaultWebpack;
    }): Promise<{
      stats: defaultWebpack.Stats;
    }>;
    setupDevServerOpts({
      bundleConfigs,
      bundleImplementor,
    }: {
      bundleConfigs: defaultWebpack.Configuration[];
      bundleImplementor?: typeof defaultWebpack;
    }): IServerOpts;
  }

  interface TypedConfiguration extends Configuration {
    type?: ConfigType;
  }

  export function cleanTmpPathExceptCache(arg: { absTmpPath: string }): void;
  export function getBundleAndConfigs(arg: {
    api: IApi;
    port?: number;
  }): Promise<{ bundler: Bundler; bundleConfigs: TypedConfiguration[]; bundleImplementor?: typeof webpack }>;
}
declare module '@umijs/preset-built-in/lib/plugins/commands/dev/watchPkg' {
  export function watchPkg(opts: { cwd: string; onChange: Function }): () => void;
}
