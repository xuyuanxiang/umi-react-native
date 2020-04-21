/**
 * @file forked from https://github.com/umijs/umi
 */
import { join } from 'path';
import getCwd from './getCwd';

export interface IPkg {
  [key: string]: string | boolean | number;
}

export default (dir: string): IPkg | undefined => {
  try {
    return require(join(getCwd(), 'package.json'));
  } catch (error) {
    try {
      return require(join(dir, 'package.json'));
    } catch (ignored) {}
  }
};
