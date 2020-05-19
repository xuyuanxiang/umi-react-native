import { renderClient } from '../src/renderClient';
import { Plugin } from 'umi';
import { render } from '@testing-library/react-native';

jest.mock('../src/Navigation', () => {
  const React = require('react');
  const View = require('react-native').View;
  function Navigation(props: any) {
    return React.createElement(View, props);
  }
  return { Navigation };
});

const plugin = new Plugin({
  validKeys: [
    'patchRoutes',
    'rootContainer',
    'render',
    'onRouteChange',
    'onReactNavigationStateChange',
    'getReactNavigationInitialState',
    'getReactNavigationInitialIndicator',
    'dva',
  ],
});

describe('renderClient', () => {
  it('should work', function () {
    const App = renderClient({
      routes: [],
      plugin,
      history: null,
      defaultTitle: 'title-test',
    });
    const { baseElement } = render(App);
    expect(baseElement).toMatchSnapshot();
  });
});
