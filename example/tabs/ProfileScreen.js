import React from 'react';
import { Text } from 'react-native';
import { getTestProps } from '../services';

export default function ProfileScreen() {
  return <Text {...getTestProps('textInProfileScreen')}>profile</Text>;
}
