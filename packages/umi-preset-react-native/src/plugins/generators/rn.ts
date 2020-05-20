import { IApi } from 'umi';
import { asyncClean, generateConfigFiles, generateFiles } from '../../utils';

interface IRNGeneratorArguments {
  dev?: boolean;
}

export default (api: IApi) => {
  async function handler(watch?: boolean): Promise<void> {
    const start = Date.now();
    api.logger.info(`Starting react-native generator in ${process.env.NODE_ENV} mode.`);

    await asyncClean(api, '.cache', 'node_modules');
    const unwatch = await generateFiles(api, watch);
    await generateConfigFiles(api);

    if (watch) {
      api.logger.info(
        'You can open another terminal and type: `yarn react-native run-ios` or `yarn react-native run-android` to launch your application.',
      );
    }

    process.on('exit', () => {
      unwatch();
      if (!watch) {
        api.logger.info(`Successfully completed in ${Date.now() - start}ms.`);
      }
    });
  }

  class RNGenerator {
    cwd: string;
    args: IRNGeneratorArguments;
    dev?: boolean;
    constructor(opts: { cwd: string; args: IRNGeneratorArguments }) {
      this.cwd = opts.cwd;
      this.args = opts.args;
      this.dev = Boolean(opts.args.dev);
      if (this.dev) {
        process.env.NODE_ENV = 'development';
      } else {
        process.env.NODE_ENV = 'production';
      }
    }

    async run(): Promise<void> {
      await this.writing();
    }

    async writing(): Promise<void> {
      await handler(this.dev);
    }
  }

  api.registerGenerator({
    key: 'rn',
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    Generator: RNGenerator,
  });
};
