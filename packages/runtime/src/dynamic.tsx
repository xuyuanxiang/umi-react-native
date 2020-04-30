import React from 'react';
import { View, Text } from 'react-native';
// RN 没有 treeShaking
import { dynamic as domDynamic } from '@umijs/runtime/dist/index.esm';

/**
 * `@umijs/runtime`中 dynamic 缺省（默认）loading 使用了 HTML p 标签和 br 标签。
 * 当用户启用[dynamicImport](https://umijs.org/config#dynamicimport)，并且没有实现自定义的 Loading 组件时，在 RN 中运行会报错，这里做了 Monkey Patch。
 */
export const dynamic = (opts: any = {}) =>
  domDynamic({
    ...opts,
    loading({ error, isLoading }: { error: Error; isLoading: boolean }) {
      if (process.env.NODE_ENV === 'development') {
        if (isLoading) {
          return <Text>loading...</Text>;
        }
        if (error) {
          return (
            <View>
              <Text>{error.message}</Text>
              <Text>{error.stack}</Text>
            </View>
          );
        }
      }
      return <Text>loading...</Text>;
    },
  });
