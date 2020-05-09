import { join } from 'path';
import { ChildProcess, fork } from 'child_process';
import { IApi } from 'umi';
import { generateFiles, asyncClean } from '../../utils';

// export interface IHaulStartOptions {
//   port?: number;
//   dev: boolean;
//   interactive?: boolean;
//   minify?: boolean;
//   tempDir?: string;
//   config: string;
//   eager: string;
//   maxWorkers?: number;
//   skipHostCheck: boolean;
// }

export default (api: IApi) => {
  const {
    paths: { absTmpPath },
  } = api;
  async function handler(): Promise<void> {
    const argv: string[] = ['start', '--config', join(absTmpPath || '', 'haul.config.js')];
    const unwatchs: Function[] = [];
    const isWatch = process.env.WATCH !== 'none';

    function unwatch(): void {
      for (const unwatch of unwatchs) {
        try {
          unwatch();
        } catch (ignored) {}
      }
    }

    function watch(fn: unknown): void {
      if (typeof fn === 'function') {
        unwatchs.push(fn);
      }
    }

    if (absTmpPath) {
      // 保留 '.cache' 和 'node_modules'文件夹
      await asyncClean(api, absTmpPath, '.cache', 'node_modules');
    }

    watch(await generateFiles({ api, watch: isWatch }));

    let child: ChildProcess | undefined;

    function start() {
      child = fork(require.resolve('@haul-bundler/cli/bin/haul.js'), argv, {
        stdio: 'inherit',
        cwd: absTmpPath,
      });

      child.on('close', (code) => {
        if (!isWatch) {
          unwatch();
          process.exit(code);
        }
      });
    }

    function destroy(single: NodeJS.Signals) {
      if (child) {
        child.kill(single);
      }
    }

    function restart() {
      destroy('SIGINT');
      start();
    }

    start();

    process.on('SIGINT', () => {
      destroy('SIGINT');
    });

    process.on('SIGTERM', () => {
      destroy('SIGTERM');
    });
  }

  api.registerCommand({
    name: 'dev-rn',
    description: 'starts react-native dev webserver',
    fn: handler,
  });
};
