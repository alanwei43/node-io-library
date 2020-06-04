import path from "path";
import fs from "fs";
import { promisify } from "util";

export interface FileInfo {
  path: string,
  stat: fs.Stats
}
export interface RecursiveOptions {
  maxDepth?: number,
  recursive?: boolean,
  filter?: (info: FileInfo) => boolean
}
export function recursiveFiles(dir: string, options?: RecursiveOptions) {
  return doList(dir, options);
}
function doList(dir: string, options: RecursiveOptions): Array<FileInfo> {
  const filterFn = options.filter || (() => true);
  const files = fs.readdirSync(dir)
    .map(f => path.join(dir, f))
    .map(f => ({
      stat: fs.statSync(f),
      path: path.resolve(f)
    })).filter(filterFn);


  if (options.recursive) {
    const children = files.filter(f => f.stat.isDirectory())
      .filter(filterFn)
      .reduce((prev, next) => prev.concat(doList(next.path, options)), []);

    return files.filter(f => f.stat.isFile()).concat(children);
  }
  return files;
}