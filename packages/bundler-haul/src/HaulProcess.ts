import { IConfig } from '@umijs/types';
import { fork, ChildProcess } from 'child_process';

export interface IHaulConfig {
  cwd?: string;
  config: IConfig;
}

export interface IHaulStartOptions {
  port?: number;
  dev: boolean;
  interactive?: boolean;
  minify?: boolean;
  tempDir?: string;
  config: string;
  eager: string;
  maxWorkers?: number;
  skipHostCheck: boolean;
}

export class HaulProcess {
  private _child?: ChildProcess;
  private readonly _cwd?: string;
  private readonly _config: Readonly<IConfig>;

  constructor({ cwd, config }: IHaulConfig) {
    this._cwd = cwd;
    this._config = config;
  }

  start({ port }: IHaulStartOptions): void {
    const argv: string[] = ['start'];

    if (port) {
      argv.push('--port', port + '');
    }

    this._child = fork(require.resolve('@haul-bundler/cli/bin/haul.js'), argv, {
      stdio: 'inherit',
      cwd: this._cwd,
    });
  }

  restart(options: IHaulStartOptions): void {
    this.destroy('SIGINT');
    this.start(options);
  }

  destroy(signal?: NodeJS.Signals | number): void {
    if (this._child) {
      this._child.kill(signal);
    }
  }
}
