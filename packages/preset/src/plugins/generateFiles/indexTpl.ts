export default `
if (global.window === undefined) {
  global.window = global;
}

{{{ importsAhead }}}
import {ApplyPluginsType} from 'umi-react-native-runtime';
import {renderClient} from 'umi-react-native-renderer';
import {plugin, history} from './core/umiExports';
import {routes} from './core/routes';
{{{ imports }}}

{{{ entryCodeAhead }}}

const getClientRender = (args = {}) => plugin.applyPlugins({
  key: 'render',
  type: ApplyPluginsType.compose,
  initialValue: () => {
    return renderClient({
      routes,
      plugin,
      history,
      appKey: '{{{ appKey }}}',
    });
  },
  args,
});

const clientRender = getClientRender();

export default clientRender();

{{{ entryCode }}}

`;
