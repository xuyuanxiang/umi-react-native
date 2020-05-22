import React from 'react';
import { Link, connect } from 'umi';
import { View, Text } from 'react-native';
import { getTestProps } from '../services';

function IndexPage({ greeting }) {
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

export default ConnectedIndexPage;
