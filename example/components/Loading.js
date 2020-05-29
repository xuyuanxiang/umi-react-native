import React from 'react';
import { Text } from 'react-native';
import { getTestProps } from '../services';

export default function Loading({ error }) {
  if (error instanceof Error) {
    return <Text>加载失败</Text>;
  }

  return <Text {...getTestProps('textInLoading')}>正在加载...</Text>;
}
