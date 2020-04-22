import { IServiceOpts, Service } from '@umijs/core';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import assert from './utils/assert';

export class ReactNativeService extends Service {
  constructor(opts: IServiceOpts) {
    process.env.UMI_VERSION = require('../package').version;
    process.env.UMI_DIR = dirname(require.resolve('../package'));
    const rn = join(opts.cwd, 'node_modules', '.bin', 'react-native');
    assert(
      existsSync(rn),
      `react-native was not found, Please execute "yarn install" to fetch all dependencies into "node_modules"`,
    );
    const app = join(opts.cwd, 'app.json');
    assert(existsSync(app), `${app} not exists`);

    super({
      ...opts,
      presets: [require.resolve('umi-react-native-preset'), ...(opts.presets || [])],
    });
  }
}
