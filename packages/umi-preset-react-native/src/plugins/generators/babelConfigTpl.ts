export default `/**
 * @file umi 生成临时文件
 * @description 添加额外的babel配置，请使用以下umi配置:
 *  + 添加 babel plugin：https://umijs.org/config#extrababelplugins
 *  + 修改默认 babel presets：https://umijs.org/config#extrababelpresets
 * @format
 */
module.exports = {
  presets: {{{presets}}},
  plugins: {{{plugins}}},
};

`;
