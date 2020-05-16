import { IApi } from 'umi';
import { join } from 'path';
import { writeFileSync } from 'fs';

const CONTENT = `/**
* @file umi 生成临时文件
*/
import '@@/umi';

`;

export default (api: IApi) => {
  const { paths } = api;

  api.onGenerateFiles(async () => {
    writeFileSync(join(paths.absSrcPath || '', 'index.js'), CONTENT, 'utf8');
  });
};
