import { IConfig } from '@umijs/types';
import { IOpts } from '@umijs/bundler-webpack/lib/getConfig/getConfig';
import { semver, lodash } from '@umijs/utils';
import {
  NormalizedProjectConfigBuilder,
  Runtime,
  BundleConfig,
  ProjectConfig,
  NormalizedProjectConfig,
} from '@haul-bundler/core';
import { join } from 'path';

export interface IMakeConfig {
  (projectConfig: ProjectConfig): NormalizedProjectConfigBuilder;
}

export interface IWithPolyfillsOptions {
  initializeCoreLocation?: string;
  additionalSetupFiles?: string[];
}

export interface IWithPolyfills {
  (entry: string | string[], options?: IWithPolyfillsOptions): { entryFiles: string[]; setupFiles: string[] };
}

export function getHaulConfig(
  cwd: string,
  config: IConfig,
  opts: Readonly<Omit<IOpts, 'cwd' | 'config'>>,
): NormalizedProjectConfig {
  const version = config?.reactNative?.version;

  if (!semver.valid(version)) {
    throw new TypeError('未知 react-native 版本');
  }
  const absOutputPath = join(cwd, config.outputPath || 'dist');
  const preset = semver.minor(version) < 60 ? '@haul-bundler/preset-0.59' : '@haul-bundler/preset-0.60';
  const makeConfig: IMakeConfig = require(preset).makeConfig;
  const withPolyfills: IWithPolyfills = require(preset).withPolyfills;
  const bundles: { [bundleName: string]: BundleConfig } = {};
  if (opts.entry && typeof opts.entry === 'object') {
    const entries = Object.keys(opts.entry);
    for (const entryName of entries) {
      const entry = opts.entry[entryName];
      if (!entry) {
        continue;
      }
      if (entryName === 'umi') {
        bundles.index = {
          entry: withPolyfills(entry),
        };
      } else {
        bundles[entryName] = {
          entry,
        };
      }
    }
  }
  const userConfig = lodash.defaultsDeep(config.haul, {
    bundles,
  });

  const getProjectConfig: NormalizedProjectConfigBuilder = makeConfig(userConfig);

  return getProjectConfig(new Runtime(), {
    platform: '',
    root: absOutputPath,
    dev: opts.env === 'development',
    port: opts.port,
    bundleMode: lodash.keys(userConfig.bundles).length > 1 ? 'multi-bundle' : 'single-bundle',
    bundleTarget: 'server',
    assetsDest: absOutputPath,
    minify: opts.env !== 'development',
  });
}
