import { EventEmitter } from "events";
import fs from "fs";
import path from "path";
import { promisify } from "util";

export function eventToPromise<T>(emitter: EventEmitter, eventNames?: { onData: string, onEnd: string, onError: string }): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const items: T[] = [];
    emitter.on(eventNames?.onData || "data", function (item: T) {
      items.push(item);
    });
    emitter.on(eventNames?.onError || "error", function (err) {
      reject(err);
    });
    emitter.on(eventNames?.onEnd || "end", function () {
      resolve(items);
    })
  });
}
export function repeat<T>(count: number, char: T): Array<T> {
  return [...Array(count)].map(() => char);
}
export function range(start: number, end: number): Array<number> {
  return [...Array(end - start)].map((val, index) => start + index);
}
export function humanSize(size: number): [number, string] {
  let result = { size: size, unit: "B" };

  if (size > 1024) {
    result.size = parseFloat((size / 1024).toFixed(2));
    result.unit = "KB";
  }

  if (size > 1024 * 1024) {
    result.size = parseFloat((size / (1024 * 1024)).toFixed(2));
    result.unit = "MB";
  }
  if (size > 1024 * 1024 * 1024) {
    result.size = parseFloat((size / (1024 * 1024 * 1024)).toFixed(2));
    result.unit = "GB";
  }

  return [result.size, result.unit];
}

export function copyFileSync(src: string, dest: string, options?: {
  chunkSize?: number,
  override?: boolean
}): "src_no_existed" | "dest_existed" | null {
  try {
    if (!fs.existsSync(src)) {
      return "src_no_existed";
    }
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, {
        recursive: true
      });
    }
    if (fs.existsSync(dest)) {
      if (options?.override) {
        fs.unlinkSync(dest);
      } else {
        return "dest_existed";
      }
    }

    fs.createReadStream(src, {
      highWaterMark: options?.chunkSize || 1024 * 1024 * 1024
    }).pipe(fs.createWriteStream(dest, {
      autoClose: true
    }));
  } catch (err) {
    return err.message;
  }
  return null;
}

export interface FilePathInfo {
  /**
   * 文件/目录地址
   */
  path: string
  /**
   * 文件所在目录/目录的父级目录
   */
  dir: string
  /**
   * 文件名/目录名
   */
  name: string
  /**
   * 文件扩展名
   */
  ext: string
  /**
   * 文件名(不带扩展名)
   */
  nameWithoutExt: string
  /**
   * 相对目录地址
   */
  relative?: string
}
export function expandFileInfo(fileOrDir: string, baseDir?: string): FilePathInfo {
  const info: FilePathInfo = {
    path: fileOrDir,
    dir: path.dirname(fileOrDir),
    name: path.basename(fileOrDir) || "",
    ext: path.extname(fileOrDir),
    nameWithoutExt: ""
  };
  info.nameWithoutExt = info.name.substr(0, info.name.length - info.ext.length);
  if (typeof baseDir === "string") {
    info.relative = path.relative(baseDir, fileOrDir);
  }
  return info;
}