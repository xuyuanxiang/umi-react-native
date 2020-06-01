import React, { useLayoutEffect } from 'react';
import { Text, Button } from 'react-native';
import { getTestProps } from '../../../services';

export default function FeedBackPage({ route, navigation }) {
  useLayoutEffect(
    () =>
      navigation.setOptions({
        headerTitle: () => <Text {...getTestProps('feedbackPageTitle')}>Feedback Page</Text>,
        headerLeft: ({ label, ...rests }) => (
          <Button title={label} {...rests} {...getTestProps('feedbackPageBackButton')} />
        ),
      }),
    [navigation],
  );
  return <Text {...getTestProps('textInFeedBackPage')}>{JSON.stringify(route.params)}</Text>;
}
