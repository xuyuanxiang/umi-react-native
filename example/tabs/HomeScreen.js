import React from 'react';
import {Text, View} from 'react-native';
import {Card, Grid, WhiteSpace, WingBlank} from '@ant-design/react-native';

const data = Array.from(new Array(12)).map((_val, i) => ({
  icon: 'https://os.alipayobjects.com/rmsportal/IptWdCkrtkAUfjE.png',
  text: `Name${i}`,
}));

export default function HomeScreen() {
  return (
    <>
      <Grid data={data} columnNum={4} isCarousel />
      <WhiteSpace size="lg" />
      <WingBlank size="lg">
        <Card>
          <Card.Header
            title="This is title"
            thumbStyle={{width: 30, height: 30}}
            thumb="https://gw.alipayobjects.com/zos/rmsportal/MRhHctKOineMbKAZslML.jpg"
            extra="this is extra"
          />
          <Card.Body>
            <View style={{height: 42}}>
              <Text style={{marginLeft: 16}}>Card Content</Text>
            </View>
          </Card.Body>
          <Card.Footer content="footer content" extra="footer extra content" />
        </Card>
      </WingBlank>
      <WhiteSpace size="lg" />
      <Card full>
        <Card.Header
          title="Full Column"
          thumbStyle={{width: 30, height: 30}}
          thumb="https://gw.alipayobjects.com/zos/rmsportal/MRhHctKOineMbKAZslML.jpg"
          extra="this is extra"
        />
        <Card.Body>
          <View style={{height: 42}}>
            <Text style={{marginLeft: 16}}>Card Content</Text>
          </View>
        </Card.Body>
        <Card.Footer content="footer content" extra="footer extra content" />
      </Card>
    </>
  );
}
