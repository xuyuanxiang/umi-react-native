import React from 'react';
import { Text } from 'react-native';
import { getTestProps } from '../services';

export default function HomeScreen() {
  return <Text {...getTestProps('textInHomeScreen')}>Home</Text>;
}
