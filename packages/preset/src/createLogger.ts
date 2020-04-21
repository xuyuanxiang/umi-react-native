import { Logger } from '@umijs/core';
import { name } from '../package.json';

export default function (category: string): Logger {
  return new Logger(`${name}:${category}`);
}
