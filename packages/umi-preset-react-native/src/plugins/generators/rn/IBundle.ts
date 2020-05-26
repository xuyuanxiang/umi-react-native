export default interface IBundle {
  name: string;
  entry: string | string[] | { entryFiles: string[]; setupFiles: string[] };
  type?: 'basic-bundle' | 'indexed-ram-bundle' | 'file-ram-bundle';
  dependsOn?: string[];
  app?: boolean;
  transform?: string;
}
