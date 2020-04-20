import { Service, IServiceOpts } from '@umijs/core';
import { dirname } from 'path';

export class ReactNativeService extends Service {
  constructor(opts: IServiceOpts) {
    process.env.UMI_VERSION = require('../package').version;
    process.env.UMI_DIR = dirname(require.resolve('../package'));
    super({
      ...opts,
      presets: [require.resolve('umi-react-native-builtin-presets'), ...(opts.presets || [])],
      // plugins: [require.resolve('./plugins/umiAlias'), ...(opts.plugins || [])],
    });
  }
}
