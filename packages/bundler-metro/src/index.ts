import { IApi } from '@umijs/types';
import { join } from 'path';
import { existsSync } from 'fs';
import { constants } from 'os';
import http, { Server as HttpServer } from 'http';
import { Server as HttpsServer } from 'https';
import assert from 'assert';
import generateFiles from '@umijs/preset-built-in/lib/plugins/commands/generateFiles';
import { cleanTmpPathExceptCache } from '@umijs/preset-built-in/lib/plugins/commands/buildDevUtils';
import { watchPkg } from '@umijs/preset-built-in/lib/plugins/commands/dev/watchPkg';
import loadMetroConfig from '@react-native-community/cli/build/tools/loadMetroConfig';
import loadConfig from '@react-native-community/cli/build/tools/config';
import eventsSocketModule from '@react-native-community/cli/build/commands/server/eventsSocket';
import messageSocket from '@react-native-community/cli/build/commands/server/messageSocket';
import webSocketProxy from '@react-native-community/cli/build/commands/server/webSocketProxy';
import MiddlewareManager from '@react-native-community/cli/build/commands/server/middleware/MiddlewareManager';
import releaseChecker from '@react-native-community/cli/build/tools/releaseChecker';
import enableWatchMode from '@react-native-community/cli/build/commands/server/watchMode';
import getIPAddress from './getIPAddress';

export default (api: IApi) => {
  const {
    logger,
    paths,
    utils: { chalk, portfinder },
  } = api;
  const METRO_PATH = join(paths.absNodeModulesPath || '', 'metro');
  const METRO_CORE_PATH = join(paths.absNodeModulesPath || '', 'metro-core');

  assert(existsSync(METRO_PATH), '未找到 "metro"，请执行 `yarn install` 安装所有依赖。');
  assert(existsSync(METRO_CORE_PATH), '未找到 "metro-core"，请执行 `yarn install` 安装所有依赖。');

  let port: number;
  let hostname: string;
  let server: HttpServer | HttpsServer;
  const unwatchs: (() => void)[] = [];

  function destroy(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      for (const unwatch of unwatchs) {
        try {
          unwatch();
        } catch (ignored) {}
      }
      if (server) {
        server.close((err) => (err ? reject(err) : resolve()));
      } else {
        resolve();
      }
    });
  }

  api.registerCommand({
    name: 'dev-rn',
    description: 'starts react-native dev webserver',
    fn: async ({ args }) => {
      const defaultPort = process.env.PORT || args?.port || api.config.devServer?.port;
      port = await portfinder.getPortPromise({
        port: defaultPort ? parseInt(String(defaultPort), 10) : 8081,
      });
      hostname = process.env.HOST || api.config.devServer?.host || getIPAddress();

      logger.info('rn-dev:', args, 'hostname=', hostname, 'port=', port);

      cleanTmpPathExceptCache({
        absTmpPath: paths.absTmpPath!,
      });
      const watch = process.env.WATCH !== 'none';

      async function startMetroServer(): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const Metro = require(METRO_PATH);
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { Terminal } = require(METRO_CORE_PATH);
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const TerminalReporter = require(join(METRO_PATH, 'src', 'lib', 'TerminalReporter'));
        const terminal = new Terminal(process.stdout);
        const terminalReporter = new TerminalReporter(terminal);
        // eslint-disable-next-line
        let eventsSocket: ReturnType<typeof eventsSocketModule.attachToServer> | undefined;

        const reporter = {
          update(event: any) {
            terminalReporter.update(event);
            if (eventsSocket) {
              eventsSocket.reportEvent(event);
            }
          },
        };
        const ctx = loadConfig(paths.cwd);
        logger.info('ctx:', ctx);
        const metroConfig = await loadMetroConfig(ctx, {
          ...args,
          config: join(paths.cwd || '', 'metro.config.js'),
          projectRoot: paths.absTmpPath,
          reporter,
        });
        if (Array.isArray(args.assetPlugins)) {
          metroConfig.transformer.assetPlugins = args.assetPlugins.map((plugin) => require.resolve(plugin));
        }

        const middlewareManager = new MiddlewareManager({
          host: hostname,
          port: metroConfig.server.port || port,
          watchFolders: metroConfig.watchFolders,
        });

        metroConfig.watchFolders.forEach(middlewareManager.serveStatic.bind(middlewareManager));

        const customEnhanceMiddleware = metroConfig.server.enhanceMiddleware;

        metroConfig.server.enhanceMiddleware = (middleware: any, server: unknown) => {
          if (customEnhanceMiddleware) {
            middleware = customEnhanceMiddleware(middleware, server);
          }

          return middlewareManager.getConnectInstance().use(middleware);
        };

        logger.info('metroConfig:', metroConfig);
        server = await Metro.runServer(metroConfig, {
          host: args.host,
          secure: args.https,
          secureCert: args.cert,
          secureKey: args.key,
          hmrEnabled: true,
        });

        const wsProxy = webSocketProxy.attachToServer(server, '/debugger-proxy');
        const ms = messageSocket.attachToServer(server, '/message');
        eventsSocket = eventsSocketModule.attachToServer(server, '/events', ms);

        middlewareManager.attachDevToolsSocket(wsProxy);
        middlewareManager.attachDevToolsSocket(ms);

        if (args.interactive) {
          enableWatchMode(ms);
        }

        middlewareManager
          .getConnectInstance()
          .use('/reload', (_req: http.IncomingMessage, res: http.ServerResponse) => {
            ms.broadcast('reload');
            res.end('OK');
          });

        // In Node 8, the default keep-alive for an HTTP connection is 5 seconds. In
        // early versions of Node 8, this was implemented in a buggy way which caused
        // some HTTP responses (like those containing large JS bundles) to be
        // terminated early.
        //
        // As a workaround, arbitrarily increase the keep-alive from 5 to 30 seconds,
        // which should be enough to send even the largest of JS bundles.
        //
        // For more info: https://github.com/nodejs/node/issues/13391
        //
        server.keepAliveTimeout = 30000;

        await releaseChecker(ctx.root);
      }

      async function restartServer(): Promise<void> {
        console.log(chalk.gray(`Try to restart dev server...`));
        try {
          await destroy();
          await startMetroServer();
        } catch (err) {
          console.log(chalk.red('Dev server restarting failed'), err);
          process.exit(constants.signals.SIGHUP);
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
            restartServer();
          },
        });
        unwatchs.push(unwatchPkg);

        // watch config change
        const unwatchConfig = api.service.configInstance.watch({
          userConfig: api.service.userConfig,
          onChange: async ({ pluginChanged, valueChanged }) => {
            if (pluginChanged.length) {
              console.log();
              api.logger.info(`Plugins of ${pluginChanged.map((p) => p.key).join(', ')} changed.`);
              restartServer();
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
                restartServer();
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

      await startMetroServer();
    },
  });

  api.registerCommand({
    name: 'build-rn',
    description: 'builds react-native javascript bundle for offline use',
    fn: async ({ args: { platform } }) => {
      logger.info('rn-build:', platform);
      await generateFiles({ api });
    },
  });
};
