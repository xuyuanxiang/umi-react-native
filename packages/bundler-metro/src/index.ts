import { IApi } from 'umi';
import { join } from 'path';
import { existsSync } from 'fs';
import { constants, EOL } from 'os';
import { Server as HttpServer, IncomingMessage, ServerResponse } from 'http';
import { Server as HttpsServer } from 'https';
import generateFiles from '@umijs/preset-built-in/lib/plugins/commands/generateFiles';
import { cleanTmpPathExceptCache } from '@umijs/preset-built-in/lib/plugins/commands/buildDevUtils';
import { watchPkg } from '@umijs/preset-built-in/lib/plugins/commands/dev/watchPkg';
import getIPAddress from './getIPAddress';

function assertExists(path: string): void {
  if (!existsSync(path)) {
    throw new TypeError(
      `未能找到：${path}${EOL}请确认：${EOL}  1. 是否在 react-native 工程根目录下执行；${EOL}  2. 是否已执行 \`yarn install\` 安装所有依赖。`,
    );
  }
}

interface MetroConfig {
  resolver: {
    resolverMainFields: string[];
    platforms: string[];
    extraNodeModules?: {
      [key: string]: string;
    };
  };
  serializer: {
    getModulesRunBeforeMainModule: () => string[];
    getPolyfills: () => any;
  };
  server: {
    port: number;
    enhanceMiddleware?: Function;
  };
  symbolicator: {
    customizeFrame: (frame: { file: string | null }) => { collapse: boolean };
  };
  transformer: {
    babelTransformerPath: string;
    assetRegistryPath: string;
    assetPlugins?: Array<string>;
  };
  watchFolders: string[];
  reporter?: any;
}

export default (api: IApi) => {
  const {
    logger,
    paths,
    utils: { chalk, portfinder, winPath },
  } = api;
  const METRO_PATH = join(paths.absNodeModulesPath || '', 'metro');
  const METRO_CORE_PATH = join(paths.absNodeModulesPath || '', 'metro-core');
  const RNC_CLI_PATH = join(paths.absNodeModulesPath || '', '@react-native-community', 'cli');

  assertExists(METRO_PATH);
  assertExists(METRO_CORE_PATH);
  assertExists(RNC_CLI_PATH);

  const loadMetroConfig = require(join(RNC_CLI_PATH, 'build', 'tools', 'loadMetroConfig'));
  const loadConfig = require(join(RNC_CLI_PATH, 'build', 'tools', 'config')).default;
  const eventsSocketModule = require(join(RNC_CLI_PATH, 'build', 'commands', 'server', 'eventsSocket'));
  const messageSocket = require(join(RNC_CLI_PATH, 'build', 'commands', 'server', 'messageSocket'));
  const webSocketProxy = require(join(RNC_CLI_PATH, 'build', 'commands', 'server', 'webSocketProxy'));
  const MiddlewareManager = require(join(
    RNC_CLI_PATH,
    'build',
    'commands',
    'server',
    'middleware',
    'MiddlewareManager',
  ));
  const releaseChecker = require(join(RNC_CLI_PATH, 'build', 'tools', 'releaseChecker'));
  const enableWatchMode = require(join(RNC_CLI_PATH, 'build', 'commands', 'server', 'watchMode'));

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
        const config = join(paths.cwd || '', 'metro.config.js');
        const metroConfig = (await loadMetroConfig(ctx, {
          ...args,
          config:
            typeof args.config === 'string' && args.config.length > 0
              ? args.config
              : existsSync(config)
              ? config
              : undefined,
          projectRoot: paths.absTmpPath,
          reporter,
        })) as MetroConfig;
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

        if (Array.isArray(metroConfig.resolver.resolverMainFields)) {
          metroConfig.resolver.resolverMainFields.unshift('module');
        } else {
          metroConfig.resolver.resolverMainFields = ['module', 'react-native', 'browser', 'main'];
        }

        const extraNodeModules = {
          react: winPath(join(api.paths.absNodeModulesPath || '', 'react')),
          'react-native': winPath(join(api.paths.absNodeModulesPath || '', 'react-native')),
        };
        if (typeof metroConfig.resolver.extraNodeModules === 'object') {
          Object.assign(metroConfig.resolver.extraNodeModules, api.config.alias, extraNodeModules);
        } else {
          metroConfig.resolver.extraNodeModules = Object.assign({}, api.config.alias, extraNodeModules);
        }
        logger.info('alias:', metroConfig.resolver.extraNodeModules);

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

        middlewareManager.getConnectInstance().use('/reload', (_req: IncomingMessage, res: ServerResponse) => {
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
