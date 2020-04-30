import { createContext } from 'react';
import { RouteComponentProps } from 'react-router';

const context = createContext<Partial<RouteComponentProps>>({});
context.displayName = 'Router';

export default context;
