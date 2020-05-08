import React from 'react';
import { RouteProps } from 'react-router';
import RouterContext from './RouterContext';

export default function Route(props: RouteProps & any): JSX.Element {
  return (
    <RouterContext.Consumer>
      {(context) => {
        const { location, match, history } = context;
        const newProps = { ...context, location, match };
        const { render } = props;

        return (
          <RouterContext.Provider value={newProps}>
            {newProps.match
              ? render({
                  ...props.layoutProps,
                  ...newProps,
                })
              : null}
          </RouterContext.Provider>
        );
      }}
    </RouterContext.Consumer>
  );
}
