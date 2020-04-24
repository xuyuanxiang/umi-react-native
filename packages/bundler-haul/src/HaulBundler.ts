import { IConfig } from 'umi';
import defaultWebpack from 'webpack';
import {
  DEFAULT_CONFIG_FILENAME,
  INTERACTIVE_MODE_DEFAULT,
  getProjectConfigPath,
  getNormalizedProjectConfigBuilder,
  Server,
  Runtime,
} from '@haul-bundler/core';

interface IOpts {
  cwd: string;
  config: IConfig;
}
export class HaulBundler {
  static id = 'haul';
  static version = '0.19.0';
  cwd: string;
  config: IConfig;

  constructor({ cwd, config }: IOpts) {
    this.cwd = cwd;
    this.config = config;
  }
}
