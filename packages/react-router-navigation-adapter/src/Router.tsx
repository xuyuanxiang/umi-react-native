import React, { PropsWithChildren, useEffect } from 'react';
import { RouterProps } from 'react-router';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

export function Router({ children, history }: PropsWithChildren<RouterProps>): JSX.Element {
  useEffect(
    () =>
      history.listen((location, action) => {
        switch (action) {
          case 'POP':
        }
      }),
    [history],
  );
  return (
    <NavigationContainer>
      <Stack.Navigator>{children}</Stack.Navigator>
    </NavigationContainer>
  );
}
