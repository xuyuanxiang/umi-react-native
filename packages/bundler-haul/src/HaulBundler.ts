import { IConfig } from 'umi';
import { fork, ChildProcess } from 'child_process';

export interface IHaulBundlerConfig {
  cwd?: string;
  config: IConfig;
}

export interface IStartOptions {
  port?: number;
}

export class HaulBundler {
  private _child?: ChildProcess;
  private _port?: number;
  private readonly _cwd?: string;
  private readonly _config: Readonly<IConfig>;

  constructor({ cwd, config }: IHaulBundlerConfig) {
    this._cwd = cwd;
    this._config = config;
  }

  start({ port }: IStartOptions): void {
    this._port = port;
    const argv: string[] = ['start'];

    if (port) {
      argv.push('--port', port + '');
    }

    this._child = fork(require.resolve('@haul-bundler/cli/bin/haul.js'), argv, {
      stdio: 'inherit',
      cwd: this._cwd,
    });
  }

  restart(): void {
    this.destroy('SIGINT');
    this.start({ port: this._port });
  }

  destroy(signal?: NodeJS.Signals | number): void {
    if (this._child) {
      this._child.kill(signal);
    }
  }
}
