import React from 'react';
import { Text, View } from 'react-native';
import { getTestProps } from '../../../services';

export default function FeedBackLayout({ children }) {
  return (
    <View {...getTestProps('feedbackLayoutView')}>
      <Text {...getTestProps('textInFeedbackLayout')}>Feedback Layout</Text>
      {children}
    </View>
  );
}
