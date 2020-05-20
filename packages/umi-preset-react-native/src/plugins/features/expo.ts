import { IApi } from 'umi';
import { existsSync } from 'fs';
import { getUserLib } from '../../utils';

export default (api: IApi) => {
  const EXPO_PATH = getUserLib({
    api,
    target: 'expo/package.json',
    dir: true,
  });

  // umi-preset-react-native 扩展配置
  api.describe({
    key: 'expo',
    config: {
      default: existsSync(EXPO_PATH),
      schema(joi) {
        return joi.boolean().optional();
      },
    },
  });
};
