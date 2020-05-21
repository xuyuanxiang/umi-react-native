import React from 'react';
import { Link } from 'umi';
import { View, Text } from 'react-native';
import { getTestProps } from '../services';

export default function IndexPage() {
  return (
    <View>
      <Link to="/home?foo=bar" component={Text} {...getTestProps('linkToHome')}>
        Go to home
      </Link>
      <Link to="/login" component={Text} {...getTestProps('linkToLogin')}>
        Go to login
      </Link>
    </View>
  );
}
