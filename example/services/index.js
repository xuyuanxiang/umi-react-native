import { Platform } from 'react-native';

export function getTestProps(id) {
  return Platform.select({
    ios: { testID: id },
    android: { testID: id, accessibilityLabel: id },
  });
}
