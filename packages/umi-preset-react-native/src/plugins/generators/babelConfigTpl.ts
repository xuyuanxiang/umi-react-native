export default `/**
 * @file umi 生成临时文件
 * @description 添加额外的babel配置，请使用以下umi配置:
 *  + extraBabelPlugins配置：https://umijs.org/config#extrababelplugins
 *  + extraBabelPresets配置：https://umijs.org/config#extrababelpresets
 * @format
 */
module.exports = {
  presets: {{{presets}}},
  plugins: {{{plugins}}},
};

`;
