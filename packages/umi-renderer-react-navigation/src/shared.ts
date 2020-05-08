import { FunctionComponent } from 'react';
import { History, Location } from 'history-with-query';
import { match } from 'react-router';

interface IComponent extends FunctionComponent {
  getInitialProps?: Function;
}

export interface IRoute {
  title?: string;
  path?: string;
  exact?: boolean;
  redirect?: string;
  component?: IComponent;
  routes?: IRoute[];
  strict?: boolean;
  sensitive?: boolean;
  wrappers?: any[];
  [key: string]: any;
}

export interface IRouteComponentProps<
  Params extends { [K in keyof Params]?: string } = {},
  Query extends { [K in keyof Query]?: string } = {}
> {
  children: JSX.Element;
  location: Location & { query: Query };
  route: IRoute;
  history: History;
  match: match<Params>;
}
