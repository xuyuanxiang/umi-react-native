import React from 'react';
import { View } from 'react-native';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createHistoryNavigator } from '../src/createHistoryNavigator';

jest.mock('@react-navigation/stack', () => {
  const React = require('react');
  const View = require('react-native').View;
  function StackView() {
    return React.createElement(View);
  }
  return {
    StackView,
  };
});

describe('createHistoryNavigator', () => {
  it('should work', function () {
    const listen = jest.fn();
    const { Navigator, Screen } = createHistoryNavigator();
    const { baseElement } = render(
      React.createElement(
        NavigationContainer,
        null,
        React.createElement(
          Navigator,
          // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
          // @ts-ignore
          { history: { listen } },
          React.createElement(Screen, {
            name: 'test',
            component: function ScreenComponent(props: any) {
              return React.createElement(View, props);
            },
          }),
        ),
      ),
    );
    expect(listen).toBeCalledTimes(1);
    expect(baseElement).toMatchSnapshot();
  });
});
