import defaultWebpack from 'webpack';
// import webpackDevMiddleware from 'webpack-dev-middleware';
import { IServerOpts } from '@umijs/server';
import { ConfigType } from '@umijs/bundler-utils';
import { Bundler } from '@umijs/bundler-webpack';
import { IOpts } from '@umijs/bundler-webpack/lib/getConfig/getConfig';
import { lodash } from '@umijs/utils';
import { NormalizedProjectConfig } from '@haul-bundler/core';
import { getHaulConfig } from './getHaulConfig';
import { getPluginAndUserBabelLoaderOptions, IBabelLoaderOptions } from './getPluginAndUserBabelLoaderOptions';
import { getPluginAndUserWebpackConfigs } from './getPluginAndUserWebpackConfigs';

export class HaulBundler extends Bundler {
  private projectConfig?: NormalizedProjectConfig;
  private pluginAndUserWebpackConfig?: defaultWebpack.Configuration;
  // private pluginAndUserBabelConfig?: IBabelLoaderOptions;

  // 覆写该方法，只返回 umi 插件和用户的 webpack 配置
  async getConfig(opts: Omit<IOpts, 'cwd' | 'config'>): Promise<defaultWebpack.Configuration> {
    // 只处理csr
    if (opts.type === ConfigType.ssr) {
      return super.getConfig(opts);
    }

    this.projectConfig = getHaulConfig(this.cwd, this.config, opts);
    // this.pluginAndUserBabelConfig = await getPluginAndUserBabelLoaderOptions(this.cwd, this.config, opts);
    this.pluginAndUserWebpackConfig = await getPluginAndUserWebpackConfigs(this.cwd, this.config, opts);

    return this.pluginAndUserWebpackConfig;
  }

  private getDistinctConfigurations(bundleConfigs: defaultWebpack.Configuration[]): defaultWebpack.Configuration[] {
    const configurations: defaultWebpack.Configuration[] = [];

    if (this.projectConfig) {
      // 以插件和用户的 webpack 配置为最高优先级，merge 到 haul 的配置中
      const bundles = Object.keys(this.projectConfig.webpackConfigs);
      for (const bundleName of bundles) {
        const webpackConfig = this.projectConfig.webpackConfigs[bundleName];
        configurations.push(lodash.defaultsDeep(this.pluginAndUserWebpackConfig, webpackConfig));
      }
    }

    // 剔除 之前 getConfig 返回的  插件和用户 webpack配置
    for (const bundleConfig of bundleConfigs) {
      if (lodash.isEqual(bundleConfig, this.pluginAndUserWebpackConfig)) {
        continue;
      }
      // 只保留 ssr 的 webpack 配置，如果有的话
      configurations.push(bundleConfig);
    }

    return configurations;
  }

  async build({
    bundleConfigs,
    bundleImplementor = defaultWebpack,
  }: {
    bundleConfigs: defaultWebpack.Configuration[];
    bundleImplementor?: typeof defaultWebpack;
  }): Promise<{ stats: defaultWebpack.Stats }> {
    // 如果没有haul的配置参数则还是使用umi默认的构建方法
    if (!this.projectConfig || lodash.isEmpty(this.projectConfig.webpackConfigs)) {
      return super.build({ bundleConfigs, bundleImplementor });
    }
    return super.build({ bundleConfigs: this.getDistinctConfigurations(bundleConfigs), bundleImplementor });
  }

  setupDevServerOpts({
    bundleConfigs,
    bundleImplementor = defaultWebpack,
  }: {
    bundleConfigs: defaultWebpack.Configuration[];
    bundleImplementor?: typeof defaultWebpack;
  }): IServerOpts {
    if (!this.projectConfig || lodash.isEmpty(this.projectConfig.webpackConfigs)) {
      return super.setupDevServerOpts({ bundleConfigs, bundleImplementor });
    }

    return super.setupDevServerOpts({
      bundleConfigs: this.getDistinctConfigurations(bundleConfigs),
      bundleImplementor,
    });
  }
}
