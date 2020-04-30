import { IApi } from '@umijs/types';

const CONTENT = `{{{ polyfills }}}
import 'react-native/Libraries/Core/InitializeCore.js';

// @ts-ignore
if (global.window === undefined) {
  // @ts-ignore
  global.window = global;
}

`;

export default (api: IApi) => {
  const {
    utils: { Mustache, semver },
  } = api;
  api.addPolyfillImports(() => [
    {
      source: './react-native/polyfill',
    },
  ]);

  api.onGenerateFiles(() => {
    const polyfills: string[] = [];
    if (semver.lt(api.config?.reactNative?.version, '0.60.0')) {
      polyfills.push(
        require.resolve('@haul-bundler/preset-0.59/vendor/polyfills/console.js'),
        require.resolve('@haul-bundler/preset-0.59/vendor/polyfills/error-guard.js'),
      );
    } else {
      polyfills.push('react-native/Libraries/polyfills/console.js', 'react-native/Libraries/polyfills/error-guard.js');
    }
    api.writeTmpFile({
      path: 'react-native/polyfill.ts',
      content: Mustache.render(CONTENT, {
        polyfills: polyfills.map((it: string) => `import '${it}';`).join('\n'),
      }),
    });
  });
};
