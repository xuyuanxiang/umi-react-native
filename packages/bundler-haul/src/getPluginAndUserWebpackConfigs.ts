import defaultWebpack from 'webpack';
import { IOpts } from '@umijs/bundler-webpack/lib/getConfig/getConfig';
import { lodash } from '@umijs/utils';
import Config from 'webpack-chain';
import { IConfig } from '@umijs/types';

export async function getPluginAndUserWebpackConfigs(
  cwd: string,
  config: IConfig,
  opts: Omit<IOpts, 'cwd' | 'config'>,
): Promise<defaultWebpack.Configuration> {
  const env = opts.env === 'production' ? 'production' : 'development';
  const webpack: typeof defaultWebpack = opts.bundleImplementor || defaultWebpack;
  let webpackConfig = new Config();
  const alias = config.alias;

  if (typeof alias === 'object') {
    Object.keys(alias).forEach((key) => {
      const value = alias[key];
      if (value) {
        webpackConfig.resolve.alias.set(key, value);
      }
    });
  }

  if (opts.chainWebpack) {
    webpackConfig = await opts.chainWebpack(webpackConfig, {
      webpack,
      createCSSRule: lodash.noop,
    });
  }

  // 用户配置的 chainWebpack 优先级最高
  if (config.chainWebpack) {
    await config.chainWebpack(webpackConfig, {
      env,
      webpack,
      createCSSRule: lodash.noop,
    });
  }

  return webpackConfig.toConfig();
}
