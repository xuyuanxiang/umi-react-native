import React from 'react';
import { Text } from 'react-native';
import { Service, utils } from 'umi';
import rimraf from 'rimraf';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import { render } from '@testing-library/react-native';
const { winPath, resolve } = utils;

const cwd = join(__dirname, 'fixtures');
const absTmp = join(cwd, '.umi-test');
const service = new Service({
  cwd,
  plugins: [require.resolve('../packages/umi-plugin-antd-react-native/src')],
  presets: [
    require.resolve('../packages/umi-preset-react-native/src'),
    require.resolve('../packages/umi-preset-react-navigation/src'),
  ],
});

beforeAll(async () => {
  rimraf.sync(absTmp);

  await service.run({
    name: 'g',
    args: {
      _: ['g', 'rn'],
    },
  });
});

describe('umi-preset-react-native', () => {
  it('should append alias into babel-plugin-module-resolver', () => {
    const { presets, plugins } = require(join(cwd, 'babel.config.js'));
    expect(presets).toContainEqual('module:metro-react-native-babel-preset');
    expect(presets).toContainEqual('babel-preset-extra-fake');
    expect(plugins).toContainEqual('babel-plugin-extra-fake');
    const libsBuiltIn = ['react', 'react-router', 'react-dom'];
    const presetBuiltInPath = dirname(resolve.sync('@umijs/preset-built-in/package.json'));
    const aliasBuiltIn = libsBuiltIn
      .map((key) => ({
        [key]: winPath(dirname(resolve.sync(`${key}/package.json`, { basedir: presetBuiltInPath }))),
      }))
      .reduce((previousValue, currentValue) => ({ ...previousValue, ...currentValue }));
    const libs = [
      { name: 'umi', path: 'umi' },
      { name: 'regenerator-runtime', path: 'regenerator-runtime' },
      { name: 'history', path: 'history-with-query' },
      { name: 'react-router-native', path: 'react-router-native' },
      { name: 'react-native', path: 'react-native' },
      { name: '@react-native-community/masked-view', path: '@react-native-community/masked-view' },
      { name: 'react-native-gesture-handler', path: 'react-native-gesture-handler' },
      { name: 'react-native-reanimated', path: 'react-native-reanimated' },
      { name: 'react-native-safe-area-context', path: 'react-native-safe-area-context' },
      { name: 'react-native-screens', path: 'react-native-screens' },
    ];
    const alias = libs
      .map(({ name, path }) => {
        try {
          return { [name]: winPath(dirname(resolve.sync(`${path}/package.json`))) };
        } catch (ignored) {
          return { [name]: winPath(dirname(require.resolve('react-router-native/package.json'))) };
        }
      })
      .reduce((previousValue, currentValue) => ({ ...previousValue, ...currentValue }));

    expect(plugins).toContainEqual([
      require.resolve('babel-plugin-module-resolver'),
      {
        root: [cwd],
        extensions: ['.ts', '.tsx', '.native.js', '.native.jsx', '.esm.js', '.js', '.jsx', '.json'],
        alias: {
          ...aliasBuiltIn,
          ...alias,
          'react-router-dom': 'react-router-native',
          '@': cwd,
          '@@': absTmp,
          './core/polyfill': './react-native/polyfill',
        },
      },
    ]);
  });

  it('should write react-navigation/exports.ts', () => {
    expect(readFileSync(join(absTmp, 'react-navigation', 'exports.ts'), 'utf8')).toMatchSnapshot();
  });
});
