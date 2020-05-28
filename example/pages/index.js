import React from 'react';
import { Link, connect } from 'umi';
import { View, Text } from 'react-native';
import { getTestProps } from '../services';

function IndexPage({ greeting }) {
  if (__DEV__) {
    console.info('IndexPage render');
  }
  return (
    <View>
      <Link to="/home?foo=bar" component={Text} {...getTestProps('linkToHome')}>
        Go to home
      </Link>
      <Text {...getTestProps('greetingText')}>{greeting}</Text>
    </View>
  );
}

const ConnectedIndexPage = connect(({ foo: { greeting } }) => ({ greeting }))(IndexPage);

ConnectedIndexPage.title = 'Index Page';

export default ConnectedIndexPage;
