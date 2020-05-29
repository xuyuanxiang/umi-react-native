import React from 'react';
import { View } from 'react-native';
import { BackButton } from 'umi';
import { getTestProps } from '../services';

export default function Layout({ children }) {
  return (
    <BackButton>
      <View {...getTestProps('basicLayoutView')}>{children}</View>
    </BackButton>
  );
}
