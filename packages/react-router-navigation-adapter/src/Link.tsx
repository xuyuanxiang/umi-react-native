import React, { PropsWithChildren } from 'react';
import { TouchableHighlight, GestureResponderEvent } from 'react-native';
import { LinkProps } from 'react-router-native';
import { useNavigation, StackActions } from '@react-navigation/native';
import { parse } from 'querystring';

export default function Link({
  component = TouchableHighlight,
  replace,
  to,
  children,
  onPress,
  ...others
}: PropsWithChildren<LinkProps>): JSX.Element {
  const navigation = useNavigation();
  return React.createElement(
    component,
    {
      ...others,
      onPress: (event?: GestureResponderEvent) => {
        let name: string | undefined;
        let params: object | undefined;
        if (typeof to === 'string') {
          name = to;
        } else if (to && typeof to === 'object') {
          const { pathname, search } = to;
          if (typeof pathname === 'string') {
            name = pathname;
          }
          if (typeof search === 'string') {
            const query = search.replace(/^?/, '');
            params = parse(query);
          }
        }
        if (name) {
          if (replace) {
            navigation.dispatch(StackActions.replace(name, params));
          } else {
            navigation.dispatch(StackActions.push(name, params));
          }
        }
        if (typeof onPress === 'function') {
          onPress(event);
        }
      },
    },
    children,
  );
}
