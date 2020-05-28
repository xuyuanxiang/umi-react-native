import React from 'react';
import { Text } from 'react-native';
import { getTestProps } from '../../services';

export default function UserPage() {
  return <Text {...getTestProps('userPageText')}>user</Text>;
}
