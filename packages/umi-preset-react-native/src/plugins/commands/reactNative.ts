import { IApi } from 'umi';

export interface IHaulStartOptions {
  port?: number;
  dev?: boolean;
  interactive?: boolean;
  minify?: boolean;
  tempDir?: string;
  config?: string;
  eager?: string;
  maxWorkers?: number;
  skipHostCheck?: boolean;
}

export default (api: IApi) => {
  api.registerCommand({
    name: 'react-native',
    alias: 'rn',
    description: 'umi react-native supporting.',
    fn: ({ args: { _: [sub] = [], ...rests } }) => {
      if (sub === 'start') {
        return require('./subs/start').default(api)({ args: rests });
      } else if (sub === 'bundle') {
        return require('./subs/bundle').default(api)({ args: rests });
      }
    },
  });
};
