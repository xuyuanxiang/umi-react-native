export type Arguments<T = {}> = T & {
  /** Non-option arguments */
  _: string[];
  /** The script name or node command */
  $0: string;
  /** All remaining options */
  [argName: string]: unknown;
};

export interface ICommand {
  name: string;
  alias?: string;
  description?: string;
  details?: string;
  fn: {
    <T>({ args }: { args: Arguments<T> }): void;
  };
}
