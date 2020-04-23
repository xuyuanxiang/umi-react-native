import { readFileSync } from 'fs';
import { join } from 'path';
import { IApi } from '@umijs/types';

export default function (api: IApi) {
  const {
    utils: { Mustache },
  } = api;

  api.onGenerateFiles(async (args) => {
    const appKeyTpl = readFileSync(join(__dirname, 'appKey.tpl'), 'utf-8');
    api.writeTmpFile({
      path: 'appKey.ts',
      content: Mustache.render(appKeyTpl, {
        appKey: api.config.appKey,
      }),
    });
  });

  api.addUmiExports(() => {
    return {
      specifiers: ['APP_KEY'],
      source: `./appKey`,
    };
  });
}
