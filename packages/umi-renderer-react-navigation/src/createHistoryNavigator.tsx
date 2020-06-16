import React from 'react';
import { Platform } from 'react-native';
import {
  createNavigatorFactory,
  useNavigationBuilder,
  StackRouter,
  DefaultNavigatorOptions,
  StackActions,
  EventArg,
} from '@react-navigation/native';
import { StackView } from '@react-navigation/stack';
import { StackRouterOptions, StackNavigationState } from '@react-navigation/routers/lib/typescript/src/StackRouter';
import {
  StackNavigationEventMap,
  StackNavigationConfig,
  StackNavigationOptions,
} from '@react-navigation/stack/lib/typescript/src/types';
import { Location, Action } from 'history';
import { parse, stringify } from 'querystring';

function HistoryNavigator({
  initialRouteName,
  children,
  screenOptions,
  history,
  ...rest
}: DefaultNavigatorOptions<StackNavigationOptions> & StackRouterOptions & StackNavigationConfig & { history: any }) {
  const defaultOptions = {
    gestureEnabled: Platform.OS === 'ios',
    animationEnabled: Platform.OS !== 'web',
  };
  const { descriptors, state, navigation } = useNavigationBuilder<
    StackNavigationState,
    StackRouterOptions,
    StackNavigationOptions,
    StackNavigationEventMap
  >(StackRouter, {
    initialRouteName,
    children,
    screenOptions:
      typeof screenOptions === 'function'
        ? (...args) => ({
            ...defaultOptions,
            ...screenOptions(...args),
          })
        : {
            ...defaultOptions,
            ...screenOptions,
          },
  });

  React.useEffect(
    () =>
      navigation.addListener &&
      navigation.addListener('tabPress', (e) => {
        const isFocused = navigation.isFocused();

        // Run the operation in the next frame so we're sure all listeners have been run
        // This is necessary to know if preventDefault() has been called
        requestAnimationFrame(() => {
          if (state.index > 0 && isFocused && !(e as EventArg<'tabPress', true>).defaultPrevented) {
            // When user taps on already focused tab and we're inside the tab,
            // reset the stack to replicate native behaviour
            navigation.dispatch({
              ...StackActions.popToTop(),
              target: state.key,
            });
          }
        });
      }),
    [navigation, state.index, state.key],
  );

  React.useEffect(
    () =>
      history.listen((location: Location<any>, action: Action): void => {
        const state = navigation.dangerouslyGetState();
        if (state.routeNames.includes(location.pathname)) {
          switch (action) {
            case 'POP':
              if (state.index > history.index) {
                navigation.dispatch(StackActions.pop());
              }
              break;
            case 'PUSH':
              if (state.index < history.index) {
                navigation.dispatch(StackActions.push(location.pathname, parse(location.search.replace('?', ''))));
              }
              break;
            case 'REPLACE':
              if (state.index === history.index) {
                navigation.dispatch(StackActions.replace(location.pathname, parse(location.search.replace('?', ''))));
              }
              break;
          }
        }
      }),
    [navigation, history],
  );

  React.useEffect(() => {
    if (history.index > state.index) {
      history.go(state.index - history.index);
    } else if (history.index < state.index) {
      const route = state.routes[state.index];
      if (route) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        history.push(route.params ? `${route.name}?${stringify(route.params)}` : route.name);
      }
    }
  }, [state.index, history]);

  return <StackView {...rest} descriptors={descriptors} state={state} navigation={navigation} />;
}

export const createHistoryNavigator = createNavigatorFactory<
  StackNavigationState,
  StackNavigationOptions,
  StackNavigationEventMap,
  typeof HistoryNavigator
>(HistoryNavigator);
