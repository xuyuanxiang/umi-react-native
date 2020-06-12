import React from 'react';
import { StatusBar, Text, Button } from 'react-native';
import { connect, Link } from 'umi';
import { getTestProps } from '../services';

function IndexPage({ greeting, navigation }) {
  return (
    <>
      <StatusBar barStyle="light-content" />
      <Text {...getTestProps('textInIndexPage')}>{greeting}</Text>
      <Link
        {...getTestProps('linkToFeedbackPage')}
        to="/profile/settings/feedback?foo=bar"
        component={Button}
        title="Go to FeedbackPage"
      />
      <Button
        {...getTestProps('linkToLoginPage')}
        title="Go to LoginPage"
        onPress={() => navigation.navigate('/login')}
      />
    </>
  );
}

const ConnectedIndexPage = connect(({ foo }) => ({
  greeting: foo.greeting,
}))(IndexPage);

ConnectedIndexPage.title = '首页';
ConnectedIndexPage.headerTintColor = '#ffffff';
ConnectedIndexPage.headerTitleStyle = {
  fontWeight: 'bold',
};
ConnectedIndexPage.headerStyle = {
  backgroundColor: '#000000',
};

export default ConnectedIndexPage;
