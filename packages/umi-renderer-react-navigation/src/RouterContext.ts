import { Context } from 'react';
import { RouteComponentProps, __RouterContext } from 'react-router';

const context = __RouterContext as Context<RouteComponentProps>;

export default context;
