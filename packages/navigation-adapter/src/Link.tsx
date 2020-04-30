import React, { PropsWithChildren } from 'react';
import { TouchableHighlight } from 'react-native';
import { LinkProps } from 'react-router-native';

export function Link({
  component = TouchableHighlight,
  replace,
  to,
  children,
  ...others
}: PropsWithChildren<LinkProps>): JSX.Element {
  return React.createElement(component, others, children);
}
