export default `/**
 * @file umi 生成临时文件
 * @format
 */
{{#isExpo}}
import registerRootComponent from 'expo/build/launch/registerRootComponent';
import RootElement from '@@/umi';

registerRootComponent(() => RootElement);

{{/isExpo}}
{{^isExpo}}
export default from '@@/umi';

{{/isExpo}}
`;
