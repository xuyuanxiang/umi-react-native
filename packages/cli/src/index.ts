/**
 * @file forked from umi for removing preset-built-in
 */
import { chalk, yParser } from '@umijs/utils';
import { Service } from '@umijs/core';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { constants } from 'os';
import getCwd from './utils/getCwd';
import getPkg from './utils/getPkg';

// process.argv: [node, umi.js, command, args]
const args = yParser(process.argv.slice(2), {
  alias: {
    version: ['v'],
    help: ['h'],
  },
  boolean: ['version'],
});

if (args.version && !args._[0]) {
  args._[0] = 'version';
  const local = existsSync(join(__dirname, '../.local')) ? chalk.cyan('@local') : '';
  console.log(`umi-rn@${require('../package.json').version}${local}`);
} else if (!args._[0]) {
  args._[0] = 'help';
}

(async () => {
  try {
    const name = args._[0];
    if (name === 'build') {
      process.env.NODE_ENV = 'production';
    }
    process.env.UMI_VERSION = require('umi/package.json').version;
    process.env.UMI_DIR = dirname(require.resolve('umi/package.json'));
    process.env.UMI_RN_VERSION = require('../package.json').version;
    process.env.UMI_RN_DIR = dirname(require.resolve('../package.json'));
    // remove umi preset-built-in
    await new Service({
      cwd: getCwd(),
      pkg: getPkg(process.cwd()),
    }).run({
      name,
      args,
    });
  } catch (e) {
    console.error(chalk.red(e.message));
    console.error(e.stack);
    process.exit(constants.signals.SIGHUP);
  }
})();
