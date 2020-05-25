export default `/**
 * @file umi 生成临时文件
 * @description 添加额外的babel配置，请使用以下umi配置:
 *  + 添加 babel plugin：https://umijs.org/config#extrababelplugins
 *  + 添加 babel presets：https://umijs.org/config#extrababelpresets
 * @format
 */
{{#isExpo}}
module.exports = function(api) {
  api.cache(true);
  return {
    presets: {{{presets}}},
    plugins: {{{plugins}}},
  };
};

{{/isExpo}}
{{^isExpo}}
module.exports = {
  presets: {{{presets}}},
  plugins: {{{plugins}}},
};

{{/isExpo}}
`;
