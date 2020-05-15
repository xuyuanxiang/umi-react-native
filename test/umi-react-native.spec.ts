import { Service } from 'umi';
import rimraf from 'rimraf';
import { join } from 'path';
import { runInNewContext } from 'vm';
import { readFileSync } from 'fs';
import { render } from '@testing-library/react-native';

const cwd = join(__dirname, 'fixtures');
const absTmp = join(cwd, '.umi-test');
const service = new Service({
  cwd,
  plugins: [require.resolve('../packages/umi-plugin-antd-react-native/src')],
  presets: [
    require.resolve('../packages/umi-preset-react-native/src'),
    // require.resolve('../packages/umi-preset-react-navigation/src'),
  ],
});

beforeAll(async () => {
  rimraf.sync(absTmp);

  await service.run({
    name: 'g',
    args: {
      _: ['g', 'tmp'],
    },
  });
});

describe('umi-plugin-antd-react-native', () => {
  it('should add runtime plugin', async () => {
    const { rootContainer } = require(join(absTmp, 'antd-react-native', 'runtime.ts'));
    const RootComponent = rootContainer(null);
    const { container } = render(RootComponent);
    expect(container.props.children).toMatchSnapshot();
  });
  it('should add babel-plugin-import options for @ant-design/react-native', async () => {
    const { plugins } = require(join(absTmp, 'babel.config.js'));
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
  it('should create babel.config.js', () => {
    const { presets, plugins } = require(join(absTmp, 'babel.config.js'));
    expect(presets).toContainEqual(require.resolve('@haul-bundler/babel-preset-react-native'));
    expect(presets).toContainEqual('babel-preset-fake');
    expect(presets).toContainEqual('babel-preset-extra-fake');
    expect(plugins).toContainEqual('babel-plugin-fake');
    expect(plugins).toContainEqual('babel-plugin-extra-fake');
  });
  it('should exports BackButton and AndroidBackButton', () => {
    const { BackButton, AndroidBackButton } = require(join(absTmp, 'react-native', 'exports.ts'));
    expect(BackButton).toBeDefined();
    expect(AndroidBackButton).toBeDefined();
  });
  it('should add runtime plugin and registerComponent', () => {
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
  it('should add polyfill', () => {
    const code = readFileSync(join(absTmp, 'react-native', 'polyfill.ts'), 'utf8');
    const global: { window?: any } = {};
    runInNewContext(code, { global });
    expect(global?.window).toBe(global);
  });
});
