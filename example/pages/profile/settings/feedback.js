import React from 'react';
import { Text } from 'react-native';
import { getTestProps } from '../../../services';

export default function FeedBackPage() {
  return <Text {...getTestProps('textInFeedBackPage')}>feedback</Text>;
}
