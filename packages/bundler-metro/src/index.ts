import { IApi } from '@umijs/types';
import { join } from 'path';
import { existsSync } from 'fs';
import generateFiles from '@umijs/preset-built-in/lib/plugins/commands/generateFiles';
import { cleanTmpPathExceptCache } from '@umijs/preset-built-in/lib/plugins/commands/buildDevUtils';
import { watchPkg } from '@umijs/preset-built-in/lib/plugins/commands/dev/watchPkg';
import loadMetroConfig from '@react-native-community/cli/build/tools/loadMetroConfig';
import loadConfig from '@react-native-community/cli/build/tools/config';
import getIPAddress from './getIPAddress';

export default (api: IApi) => {
  const {
    logger,
    env,
    paths,
    utils: { chalk, portfinder },
  } = api;
  const METRO_PATH = join(api.paths.absNodeModulesPath || process.cwd(), 'metro');

  if (!existsSync(METRO_PATH)) {
    throw new TypeError('未找到 "metro"，请执行 `yarn install` 安装所有依赖。');
  }

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const MetroServer = require(join(METRO_PATH, 'src', 'Server.js'));
  let port: number;
  let hostname: string;
  let server: typeof MetroServer;
  const unwatchs: (() => void)[] = [];

  function destroy() {
    for (const unwatch of unwatchs) {
      unwatch();
    }
  }

  api.registerCommand({
    name: 'dev-rn',
    description: 'starts react-native dev webserver',
    fn: async ({ args }) => {
      logger.info('rn-dev:', args);
      const defaultPort = process.env.PORT || args?.port || api.config.devServer?.port;
      port = await portfinder.getPortPromise({
        port: defaultPort ? parseInt(String(defaultPort), 10) : 8081,
      });
      hostname = process.env.HOST || api.config.devServer?.host || getIPAddress();
      console.log(chalk.cyan('Starting the development server...'));
      // eslint-disable-next-line no-unused-expressions
      process.send?.({ type: 'UPDATE_PORT', port });

      cleanTmpPathExceptCache({
        absTmpPath: paths.absTmpPath!,
      });
      const watch = process.env.WATCH !== 'none';

      async function runMetroServer(): Promise<void> {
        const ctx = loadConfig(api.paths.cwd);
        const metroConfig = await loadMetroConfig(ctx, {
          ...args,
          watchFolders: [api.paths.absTmpPath || ''],
          projectRoot: api.paths.cwd,
          // reporter,
        });
      }

      function restartMetroServer(): void {
        if (server && typeof server.close === 'function') {
          server.close(() => {
            runMetroServer().then();
          });
        }
      }

      // generate files
      const unwatchGenerateFiles = await generateFiles({ api, watch });
      if (unwatchGenerateFiles) unwatchs.push(unwatchGenerateFiles);
      if (watch) {
        // watch pkg changes
        const unwatchPkg = watchPkg({
          cwd: api.cwd,
          onChange() {
            console.log();
            api.logger.info(`Plugins in package.json changed.`);
            api.restartServer();
          },
        });
        unwatchs.push(unwatchPkg);

        // watch config change
        const unwatchConfig = api.service.configInstance.watch({
          userConfig: api.service.userConfig,
          onChange: async ({ pluginChanged, userConfig, valueChanged }) => {
            if (pluginChanged.length) {
              console.log();
              api.logger.info(`Plugins of ${pluginChanged.map((p) => p.key).join(', ')} changed.`);
              api.restartServer();
            }
            if (valueChanged.length) {
              let reload = false;
              let regenerateTmpFiles = false;
              const fns: Function[] = [];
              const reloadConfigs: string[] = [];
              valueChanged.forEach(({ key, pluginId }) => {
                const { onChange } = api.service.plugins[pluginId].config || {};
                if (onChange === api.ConfigChangeType.regenerateTmpFiles) {
                  regenerateTmpFiles = true;
                }
                if (!onChange || onChange === api.ConfigChangeType.reload) {
                  reload = true;
                  reloadConfigs.push(key);
                }
                if (typeof onChange === 'function') {
                  fns.push(onChange);
                }
              });

              if (reload) {
                console.log();
                api.logger.info(`Config ${reloadConfigs.join(', ')} changed.`);
                api.restartServer();
              } else {
                api.service.userConfig = api.service.configInstance.getUserConfig();

                // TODO: simplify, 和 Service 里的逻辑重复了
                // 需要 Service 露出方法
                const defaultConfig = await api.applyPlugins({
                  key: 'modifyDefaultConfig',
                  type: api.ApplyPluginsType.modify,
                  initialValue: await api.service.configInstance.getDefaultConfig(),
                });
                api.service.config = await api.applyPlugins({
                  key: 'modifyConfig',
                  type: api.ApplyPluginsType.modify,
                  initialValue: api.service.configInstance.getConfig({
                    defaultConfig,
                  }) as any,
                });

                if (regenerateTmpFiles) {
                  await generateFiles({ api });
                } else {
                  fns.forEach((fn) => fn());
                }
              }
            }
          },
        });
        unwatchs.push(unwatchConfig);
      }
    },
  });

  api.registerCommand({
    name: 'build-rn',
    description: 'builds react-native javascript bundle for offline use',
    fn: async ({ args: { platform } }) => {
      logger.info('rn-build:', platform);
      // await generateFiles({ api, watch: false });
    },
  });
};
