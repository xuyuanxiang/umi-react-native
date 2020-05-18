#!/usr/bin/env node

const { join } = require('path');
const { execFileSync } = require('child_process');

const cwd = process.cwd();
const umi = join(cwd, 'node_modules', 'umi', 'bin', 'umi.js');

const child = execFileSync(umi, ['g', 'rn', '--dev'], { cwd, stdio: 'inherit' });

child.on('close', (code) => {
  process.exit(code);
});

process.on('SIGINT', () => {
  child.kill('SIGINT');
});

process.on('SIGTERM', () => {
  child.kill('SIGTERM');
});
