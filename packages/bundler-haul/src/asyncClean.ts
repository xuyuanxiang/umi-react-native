import { readdir, stat } from 'fs';
import { rimraf } from '@umijs/utils';
import { join } from 'path';

export default function asyncClean(path: string, ...excludes: string[]): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    stat(path, (_, stats) => {
      if (!_ && stats.isDirectory()) {
        readdir(path, (err, files) => {
          if (err) {
            reject(err);
          } else if (Array.isArray(files) && files.length > 0) {
            Promise.all(
              files.map(
                (file) =>
                  new Promise((resolve, reject) => {
                    if (excludes.includes(file)) {
                      resolve();
                    } else {
                      rimraf(join(path, file), (error) => (error ? reject(error) : resolve()));
                    }
                  }),
              ),
            ).then(() => resolve(), reject);
          } else {
            resolve();
          }
        });
      }
    });
  });
}
