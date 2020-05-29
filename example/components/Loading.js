import React from 'react';
import { Text } from 'react-native';

export default function Loading({ error }) {
  if (error instanceof Error) {
    return <Text>加载失败</Text>;
  }

  return <Text>正在加载...</Text>;
}
