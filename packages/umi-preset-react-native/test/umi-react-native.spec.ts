import { Service, utils } from 'umi';
import rimraf from 'rimraf';
import { dirname, join } from 'path';
import { runInNewContext } from 'vm';
import { readFileSync } from 'fs';
import { render, cleanup } from '@testing-library/react-native';

const { winPath, resolve } = utils;

const cwd = join(__dirname, 'fixtures', 'normal');
const absTmp = join(cwd, '.umi-test');
const service = new Service({
  cwd,
  plugins: [require.resolve('../../umi-plugin-antd-react-native/src')],
  presets: [require.resolve('../src')],
});

jest.mock('@ant-design/react-native', () => {
  const React = require('react');
  const View = require('react-native').View;
  function Provider(props) {
    return React.createElement(View, props);
  }
  return {
    Provider,
  };
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
afterEach(cleanup);
afterAll(() => {
  rimraf.sync(absTmp);
});

describe('umi-plugin-antd-react-native', () => {
  it('should write antd-react-native/runtime.ts', async () => {
    const { rootContainer } = require(join(absTmp, 'antd-react-native', 'runtime.ts'));
    const RootComponent = rootContainer(null);
    const { container } = render(RootComponent);
    expect(container.props.children).toMatchSnapshot();
  });
  it('should add babel-plugin-import for @ant-design/react-native', async () => {
    const { plugins } = require(join(cwd, 'babel.config.js'));
    expect(plugins).toContainEqual([
      require.resolve('babel-plugin-import'),
      {
        libraryName: '@ant-design/react-native',
      },
      '@ant-design/react-native',
    ]);
  });
});

describe('umi-preset-react-native', () => {
  it('should write babel.config.js', () => {
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

  it('should write react-native/exports.ts', () => {
    const { BackButton, AndroidBackButton } = require(join(absTmp, 'react-native', 'exports.ts'));
    expect(BackButton).toBeDefined();
    expect(AndroidBackButton).toBeDefined();
  });

  it('should write react-native/runtime.ts', () => {
    jest.mock('react-native', () => ({
      AppRegistry: {
        registerComponent(appKey: string, componentFactory: () => any) {
          if (appKey === 'RNTestApp') {
            componentFactory()();
          }
        },
      },
    }));
    const { render } = require(join(absTmp, 'react-native', 'runtime.ts'));
    const fn = jest.fn();
    render(fn);
    jest.unmock('react-native');
    expect(fn).toBeCalledTimes(1);
  });

  it('should write react-native/polyfill.ts', () => {
    const code = readFileSync(join(absTmp, 'react-native', 'polyfill.ts'), 'utf8');
    const global: { window?: any } = {};
    runInNewContext(code, { global });
    expect(global?.window).toBe(global);
  });
});
