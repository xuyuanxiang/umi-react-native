export default `
if (global.window === undefined) {
  global.window = global;
}

{{{ importsAhead }}}
import {AppRegistry} from 'react-native';
import {createHistory} from './core/history';
import {plugin} from './core/plugin';
import {renderClient} from './rn/renderClient';
{{{ imports }}}

{{{ entryCodeAhead }}}

const getClientRender = (args = {}) => plugin.applyPlugins({
  key: 'render',
  type: 'compose',
  initialValue: () => {
    return renderClient({
      routes: require('./core/routes').routes,
      plugin,
      history: createHistory(args.hot),
    });
  },
  args,
});

const clientRender = getClientRender();

const App = clientRender();

export default App;

AppRegistry.registerComponent('{{{ appKey }}}', () => () => App);

{{{ entryCode }}}

`;
