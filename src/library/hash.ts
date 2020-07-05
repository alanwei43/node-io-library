import crypto from "crypto";
import fs from "fs";
import { promisify } from "util";
import { EventEmitter } from "events";
import { RecursiveOptions, recursiveDir } from "./io-recursive";

export interface HashFileOptions {
  chunkSize?: number
}

export function fileToHash(filePath: string, chunkSize: number, digestEncode: crypto.HexBase64Latin1Encoding): EventEmitter {
  const hub = new EventEmitter();
  const md5 = crypto.createHash("md5");
  const reader = fs.createReadStream(filePath, { highWaterMark: chunkSize || 1024 * 1024 });
  const totalSize = fs.statSync(filePath).size;
  let progressSize = 0;
  reader.on("data", function (chunk: Buffer) {
    md5.update(chunk);
    progressSize += chunk.length;
    hub.emit("progress", {
      currentSize: progressSize,
      totalSize: totalSize,
    });
  });
  reader.on("close", function () {
    hub.emit("end", md5.digest(digestEncode))
  });
  return hub;
}
export function hashFile(filePath: string, options?: HashFileOptions): Promise<string> {
  return promisify(fs.exists)(filePath).then(fileExists => {
    if (!fileExists) {
      throw new Error("文件不存在");
    }
    return new Promise<string>(resolve => {
      fileToHash(filePath, options?.chunkSize, "hex").on("end", hashVal => {
        resolve(hashVal);
      });
    })
  }).catch(() => null);
}

export function hashFiles(dir: string, options: { hash?: HashFileOptions, recursive?: RecursiveOptions }): EventEmitter {
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