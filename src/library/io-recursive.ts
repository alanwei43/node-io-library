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
  deepFirst?: boolean, // 是否是深度优先
  filter?: (info: FileInfo) => boolean
}
export function recursiveFiles(dir: string, options?: RecursiveOptions): Array<FileInfo> {
  const files: Array<FileInfo> = [];

  const rootDir = path.resolve(dir);
  if (!fs.existsSync(rootDir)) {
    return files;
  }
  const dirStat = fs.statSync(rootDir);
  files.push({
    path: rootDir,
    stat: dirStat
  });
  doList(files, path.resolve(rootDir), options);
  return files;
}
function doList(list: Array<FileInfo>, dir: string, options: RecursiveOptions) {
  const filterFn = options.filter || (() => true);

  const files = fs.readdirSync(dir)
    .map(f => path.join(dir, f))
    .map(f => ({
      stat: fs.statSync(f),
      path: f
    })).filter(filterFn);

  if (options.deepFirst) {
    if (options.recursive) {
      files.filter(f => f.stat.isDirectory()).forEach(childDir => {
        doList(list, childDir.path, options);
      });
    }

    list.splice(list.length, 0, ...files);
  } else {

    list.splice(list.length, 0, ...files);

    if (options.recursive) {
      files.filter(f => f.stat.isDirectory()).forEach(childDir => {
        doList(list, childDir.path, options);
      });
    }
  }
}