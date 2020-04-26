export default `{{{ importsAhead }}}
import { AppRegistry } from 'react-native';
import { plugin } from './core/plugin';
import { createHistory } from './core/history';
import { renderClient } from './rn/renderClient';
import { ApplyPluginsType } from '{{{ runtimePath }}}';
{{{ imports }}}

{{{ entryCodeAhead }}}

const getClientRender = (args: { hot?: boolean } = {}) => plugin.applyPlugins({
  key: 'render',
  type: ApplyPluginsType.compose,
  initialValue: () => {
    return renderClient({
      // @ts-ignore
      routes: require('./core/routes').routes,
      plugin,
      history: createHistory(args.hot),
    });
  },
  args,
});

const clientRender = getClientRender();

const App = clientRender();

AppRegistry.registerComponent('{{{ appKey }}}', () => () => App);

export default App;

`;
