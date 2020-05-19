import React, { ComponentType } from 'react';
import { Service, utils } from 'umi';
import rimraf from 'rimraf';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import { render, cleanup } from '@testing-library/react-native';
const { winPath, resolve } = utils;

jest.mock('@react-navigation/native', () => {
  const React = require('react');
  const View = require('react-native').View;
  return {
    NavigationContainer(props: any) {
      return React.createElement(View, props);
    },
  };
});

jest.setTimeout(60000);

const cwd = join(__dirname, 'fixtures', 'normal');
const absTmp = join(cwd, '.umi-test');
const service = new Service({
  cwd,
  presets: [require.resolve('../../umi-preset-react-native/src'), require.resolve('../src')],
});

beforeAll(async () => {
  await service.run({
    name: 'g',
    args: {
      _: ['g', 'rn'],
    },
  });
});

afterEach(cleanup);

afterAll(() => {
  rimraf.sync(absTmp);
});

describe('umi-preset-react-navigation', () => {
  it('should append alias into babel-plugin-module-resolver', () => {
    const { plugins } = require(join(cwd, 'babel.config.js'));
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

  it('should write react-navigation/runtime.ts', async () => {
    jest.mock('umi', () => {
      const React = require('react');
      return {
        dynamic({
          loading,
          loader,
        }: {
          loading: NonNullable<ComponentType<any>>;
          loader: () => Promise<ComponentType<any>>;
        }) {
          return function LoadableComponent() {
            const Async = React.lazy(() => new Promise((resolve) => loader().then((c) => resolve({ default: c }))));
            return React.createElement(
              React.Suspense,
              { fallback: React.createElement(loading, {}, null) },
              React.createElement(Async),
            );
          };
        },
        ApplyPluginsType: {
          modify: 'modify',
          event: 'event',
        },
      };
    });
    try {
      const { rootContainer } = require(join(absTmp, 'react-navigation', 'runtime.ts'));
      const { plugin } = require(join(absTmp, 'core', 'plugin.ts'));
      const RootComponent = rootContainer(React.createElement(React.Fragment, null, 'container'), { plugin });
      const { baseElement } = render(RootComponent);
      expect(baseElement).toMatchSnapshot();
    } finally {
      jest.unmock('umi');
    }
  });
});
