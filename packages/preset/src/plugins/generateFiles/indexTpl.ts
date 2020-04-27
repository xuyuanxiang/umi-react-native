export default `
if (global.window === undefined) {
  global.window = global;
}

{{{ importsAhead }}}
import {ApplyPluginsType} from 'umi';
import {plugin, history} from './core/umiExports';
import {renderClient} from './rn/renderClient';
{{{ imports }}}

{{{ entryCodeAhead }}}

const getClientRender = (args = {}) => plugin.applyPlugins({
  key: 'render',
  type: ApplyPluginsType.compose,
  initialValue: () => {
    return renderClient({
      routes: require('./core/routes').routes,
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
