import React from 'react';
import { View, Text } from 'react-native';
import { getTestProps } from '../services';

export default function LoginPage() {
  return (
    <View {...getTestProps('loginPageView')}>
      <Text>Login Page</Text>
    </View>
  );
}
