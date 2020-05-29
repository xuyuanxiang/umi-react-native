import React from 'react';
import { View } from 'react-native';
import { getTestProps } from '../../../services';

export default function FeedBackLayout({ children }) {
  return <View {...getTestProps('feedbackLayoutView')}>{children}</View>;
}
