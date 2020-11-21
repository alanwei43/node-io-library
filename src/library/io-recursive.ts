import path from "path";
import fs from "fs";

export interface FileInfo {
  /**
   * 文件地址
   */
  path: string,
  /**
   * 文件状态
   */
  stat: fs.Stats
}
export interface RecursiveOptions {
  /**
   * 是否递归子目录
   */
  recursive?: boolean,
  /**
   * 是否深度优先
   */
  deepFirst?: boolean,
  /**
   * 目录过滤
   */
  dirFilter?: (dir: string) => boolean,
  /**
   * 文件过滤
   */
  fileFilter?: (file: string) => boolean
}

export function recursiveDir(rootDir: string, options?: RecursiveOptions): Array<FileInfo> {
  const files: Array<FileInfo> = [];

  if (!fs.existsSync(rootDir)) {
    return files;
  }
  const dirStat = fs.statSync(rootDir);
  files.push({
    path: rootDir,
    stat: dirStat
  });
  doList(files, rootDir, options);
  return files;
}
function doList(list: Array<FileInfo>, dir: string, options: RecursiveOptions) {
  const files = fs.readdirSync(dir)
    .map(f => path.join(dir, f))
    .map(f => ({
      stat: fs.statSync(f),
      path: f
    }))
    .filter(f => {
      if (f.stat.isDirectory() && typeof options.dirFilter === "function") {
        return options.dirFilter(f.path);
      }
      if (f.stat.isFile() && typeof options.fileFilter === "function") {
        return options.fileFilter(f.path);
      }
      return true;
    });

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