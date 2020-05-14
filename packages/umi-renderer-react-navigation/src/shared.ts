// import { IRoute } from '@umijs/renderer-react';
// import { CommonNavigationAction, NavigationState, StackActionType } from '@react-navigation/routers';
// import { DefaultNavigatorOptions, EventMapBase, DefaultRouterOptions } from '@react-navigation/native';
// import { Action, History, Location, TransitionPromptHook } from 'history';
//
// export type IHistoryNavigationAction = CommonNavigationAction | StackActionType;
//
// export interface IHistoryRouterOptions extends DefaultRouterOptions {
//   history: History<IHistoryNavigationState>;
//   routes: IHistoryScreenOptions[];
// }
//
// export interface IHistoryScreenOptions extends Omit<IRoute, 'component' | 'routes'> {
//   type: 'stack' | 'tab' | 'drawer';
//   [key: string]: unknown; // umi 扩展路由属性
// }
//
// export interface IHistoryNavigationState extends NavigationState {
//   type: 'history';
//   history: Location<IHistoryScreenOptions>[];
// }
//
// export interface IHistoryEventMap extends EventMapBase {
//   historyChange: {
//     data: { location: Location<IHistoryNavigationState>; action: Action };
//     canPreventDefault: false;
//   };
//   historyBlock: { data: { prompt: TransitionPromptHook<IHistoryNavigationState> }; canPreventDefault: true };
// }
//
// export interface IHistoryNavigatorProps extends DefaultNavigatorOptions<IHistoryScreenOptions> {
//   history: History<IHistoryNavigationState>;
// }
