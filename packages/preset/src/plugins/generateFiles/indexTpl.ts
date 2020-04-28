export default `// @ts-ignore
if (global.window === undefined) {
  // @ts-ignore
  global.window = global;
}
{{{ polyfillImports }}}
{{{ importsAhead }}}
import {ApplyPluginsType} from 'umi-react-native-runtime';
import {renderClient} from 'umi-react-native-renderer';
import {plugin} from './core/umiExports';
import {createHistory} from './core/history';
import {routes} from './core/routes';
{{{ imports }}}

{{{ entryCodeAhead }}}

const getClientRender = (args: { hot?: boolean } = {}) => plugin.applyPlugins({
  key: 'render',
  type: ApplyPluginsType.compose,
  initialValue: () => {
    return renderClient({
      routes,
      plugin,
      history: createHistory(args.hot),
      appKey: '{{{ appKey }}}',
    });
  },
  args,
});

const clientRender = getClientRender();

export default clientRender();

{{{ entryCode }}}

// hot module replacement
// @ts-ignore
if (module.hot) {
  // @ts-ignore
  module.hot.accept(() => {
    getClientRender({ hot: true })();
  });
}

`;
