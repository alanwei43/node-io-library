import crypto from "crypto";
import fs from "fs";
import { promisify } from "util";
import { EventEmitter } from "events";
import { RecursiveOptions, recursiveDir } from "./io-recursive";

export interface HashFileOptions {
  chunkSize?: number
}

function fileToHash(filePath: string, options?: HashFileOptions): Promise<string> {
  return new Promise(resolve => {
    const md5 = crypto.createHash("md5");
    const reader = fs.createReadStream(filePath, { highWaterMark: options?.chunkSize || 1024 * 1024 });
    reader.on("data", function (chunk) {
      md5.update(chunk);
    });
    reader.on("close", function () {
      resolve(md5.digest("hex"));
    });
  })
}
export function hashFile(filePath: string, options?: HashFileOptions): Promise<string> {
  return promisify(fs.exists)(filePath).then(fileExists => {
    if (!fileExists) {
      throw new Error("文件不存在");
    }
    return fileToHash(filePath, options);
  }).catch(() => null);
}

export function hashFiles(dir: string, options: { hash?: HashFileOptions, recursive?: RecursiveOptions }) : EventEmitter {
  const hub = new EventEmitter();
  recursiveDir(dir, options?.recursive)
    .filter(file => file.stat.isFile())
    .reduce((prev, file) => {
      return prev.then(() => {
        hub.emit("log", { status: "hashing", file: file });
        return hashFile(file.path, options?.hash).then(hashVal => {
          const data = { file: file, hash: hashVal };
          hub.emit("log", { status: "hashed", ...data });
          hub.emit("data", data);
        });
      });
    }, Promise.resolve()).then(() => {
      hub.emit("log", {
        status: "all_end"
      })
      hub.emit("end");
    });

  return hub;
}