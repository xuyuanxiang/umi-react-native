import { getTargetsAndBrowsersList, getBabelOpts, getBabelPresetOpts } from '@umijs/bundler-utils';
import { IOpts } from '@umijs/bundler-webpack/lib/getConfig/getConfig';
import { IConfig } from '@umijs/types';

export interface IBabelLoaderOptions {
  presets: (string | [string, any, (string | undefined)?] | (string | object)[])[];
  plugins: (string | [string, any, (string | undefined)?])[];
  sourceType: string;
  babelrc: boolean;
  cacheDirectory: string | boolean;
}

export async function getPluginAndUserBabelLoaderOptions(
  cwd: string,
  config: IConfig,
  opts: Omit<IOpts, 'cwd' | 'config'>,
): Promise<IBabelLoaderOptions> {
  const { type, modifyBabelPresetOpts, modifyBabelOpts } = opts;
  const env = opts.env === 'production' ? 'production' : 'development';

  const { targets } = getTargetsAndBrowsersList({
    config,
    type,
  });

  let presetOpts = getBabelPresetOpts({
    config,
    env,
    targets,
  });

  if (modifyBabelPresetOpts) {
    presetOpts = await modifyBabelPresetOpts(presetOpts);
  }

  let babelLoaderOptions: IBabelLoaderOptions = getBabelOpts({
    cwd,
    config,
    presetOpts,
  });
  if (modifyBabelOpts) {
    babelLoaderOptions = await modifyBabelOpts(babelLoaderOptions);
  }

  return babelLoaderOptions;
}
