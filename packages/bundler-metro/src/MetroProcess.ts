import { IConfig } from '@umijs/types';
import { fork, ChildProcess } from 'child_process';

export interface IMetroConfig {
  cwd?: string;
  root?: string;
  config: IConfig;
}

export interface IMetroStartOptions {
  assetPlugins?: string[];
  cert?: string;
  customLogReporterPath?: string;
  host?: string;
  https?: boolean;
  maxWorkers?: number;
  key?: string;
  platforms?: string[];
  port?: number;
  resetCache?: boolean;
  sourceExts?: string[];
  transformer?: string;
  verbose?: boolean;
  watchFolders?: string[];
  config?: string;
  projectRoot?: string;
  interactive: boolean;
}

export class MetroProcess {
  private _child?: ChildProcess;
  private readonly _cwd?: string;
  private readonly _config: Readonly<IConfig>;

  constructor({ cwd, config }: IMetroConfig) {
    this._cwd = cwd;
    this._config = config;
  }

  start({ port }: IMetroStartOptions): void {
    const argv: string[] = ['start'];

    if (port) {
      argv.push('--port', port + '');
    }

    this._child = fork(require.resolve('@haul-bundler/cli/bin/haul.js'), argv, {
      stdio: 'inherit',
      cwd: this._cwd,
    });
    this._child.on('close', (code) => process.exit(code));
  }

  restart(options: IMetroStartOptions): void {
    this.destroy('SIGINT');
    this.start(options);
  }

  destroy(signal?: NodeJS.Signals | number): void {
    if (this._child) {
      this._child.kill(signal);
    }
  }
}
