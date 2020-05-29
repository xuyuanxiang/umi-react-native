import React, { useLayoutEffect } from 'react';
import { View, Text } from 'react-native';
import { getTestProps } from '../services';

function HomePage({ route, navigation }) {
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => <Text {...getTestProps('homePageTitle')}>{HomePage.title}</Text>,
    });
  }, [navigation]);

  return (
    <View>
      <Text {...getTestProps('homePageText')}>{JSON.stringify(route.params)}</Text>
    </View>
  );
}

HomePage.title = 'Home Page';

export default HomePage;
