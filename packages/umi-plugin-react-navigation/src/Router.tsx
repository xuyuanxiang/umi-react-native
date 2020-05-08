import React, { PropsWithChildren, useEffect, useState } from 'react';
import { RouterProps } from 'react-router';
import PropTypes from 'prop-types';
import { NavigationContainer, NavigationContext } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import RouterContext from './RouterContext';

const Stack = createStackNavigator();

export function Router({ children, history }: PropsWithChildren<RouterProps>) {
  const [location, setLocation] = useState(history.location);
  useEffect(
    () =>
      history.listen((location, action) => {
        switch (action) {
          case 'POP':
        }
      }),
    [history],
  );
}

if (__DEV__) {
  Router.propTypes = {
    history: PropTypes.object.isRequired,
  };
}
