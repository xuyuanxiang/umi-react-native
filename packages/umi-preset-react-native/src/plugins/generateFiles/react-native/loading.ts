import { IApi } from 'umi';

const TEMPLATE = `{{#loading}}import loading from '{{{ loading }}}';{{/loading}}
{{^loading}}
import React from 'react';
import {View, Text} from 'react-native';
function loading({ error, isLoading }: { error: Error; isLoading: boolean }) {
  if (__DEV__) {
    if (isLoading) {
      return React.createElement(Text, null, 'Loading...');
    }
    if (error) {
      return React.createElement(View, null, React.createElement(Text, null, error.message), React.createElement(Text, null, error.stack));
    }
  }
  return React.createElement(Text, null, 'Loading...');
}
{{/loading}}

export default loading;

`;

export default (api: IApi) => {
  const {
    utils: { Mustache },
  } = api;

  api.onGenerateFiles(() => {
    const dynamicImport = api.config.dynamicImport;
    api.writeTmpFile({
      path: 'react-native/loading.ts',
      content: Mustache.render(TEMPLATE, {
        loading: typeof dynamicImport === 'object' && dynamicImport.loading ? dynamicImport.loading : '',
      }),
    });
  });
};
