import React from 'react';
import {Link} from 'umi';
import {Icon, List} from '@ant-design/react-native';

export default function ProfileScreen() {
  return (
    <List>
      <Link
        to="/feedback"
        component={List.Item}
        arrow="horizontal"
        thumb={<Icon name="info-circle" />}>
        产品建议
      </Link>
      <Link
        to="/settings"
        component={List.Item}
        arrow="horizontal"
        thumb={<Icon name="setting" />}>
        设置
      </Link>
    </List>
  );
}
