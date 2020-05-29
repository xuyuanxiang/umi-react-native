import { TransitionPresets } from 'umi';

export function getReactNavigationDefaultScreenOptions() {
  /**
   * 查看 screenOptions 全字段：https://reactnavigation.org/docs/stack-navigator/#options
   *
   * 页面转场动画相关设置，可选值：
   * - ScaleFromCenterAndroid: Standard Android navigation transition when opening or closing an Activity on Android 10 (Q).
   * - RevealFromBottomAndroid: Standard Android navigation transition when opening or closing an Activity on Android 9 (Pie).
   * - FadeFromBottomAndroid: Standard Android navigation transition when opening or closing an Activity on Android < 9 (Oreo).
   * - SlideFromRightIOS: Standard iOS navigation transition
   * - ModalSlideFromBottomIOS: Standard iOS navigation transition for modals.
   * - ModalPresentationIOS: Standard iOS modal presentation style (introduced in iOS 13).
   * 根据当前平台（iOS/Android）自动探测：
   * - DefaultTransition: Default navigation transition for the current platform.
   * - ModalTransition: Default modal transition for the current platform.
   */

  // 统一 iOS/Android 页面动画为从右侧滑入
  return {
    ...TransitionPresets.SlideFromRightIOS,
  };

  // 也可以返回一个thunk函数
  // return ({ route }) => {
  //   console.info('screenOptions:', route);
  //   // 可以单独为某个路由设置：
  //   if (route.name === '/login') {
  //     // 比如为 /pages/login.js 页面设置为从底部滑入
  //     return {
  //       ...TransitionPresets.ModalSlideFromBottomIOS,
  //     };
  //   }
  //
  //   return { ...TransitionPresets.SlideFromRightIOS };
  // };
}
