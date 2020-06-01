import React from 'react';
import { View, Text } from 'react-native';
import { BackButton } from 'umi';
import { getTestProps } from '../services';

export default function Layout({ children }) {
  return (
    <BackButton>
      <View {...getTestProps('basicLayoutView')}>
        <Text {...getTestProps('textInBasicLayout')}>Basic Layout</Text>
        {children}
      </View>
    </BackButton>
  );
}
