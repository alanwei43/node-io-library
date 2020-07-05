import { Terminal, COLOR_FOREGROUND, hashFile, fileToHash, humanSize } from "../../library";
import { Options } from "yargs";
import fs from "fs";
import path from "path";

export const command = "hash [files]";
export const desc = "计算指定文件的Hash值";
export const builder: { [key: string]: Options } = {
  files: {
    required: false,
    type: "array",
    describe: "一个或多个文件地址",
    array: true
  },
  chunkSize: {
    required: false,
    type: "number",
    describe: "每次读取的字节数",
    default: 1024 * 1024 * 100
  },
  verbose: {
    required: false,
    type: "boolean",
    default: false,
    describe: "是否显示进度"
  }
};
export const handler = function (argv: { files: Array<string>, chunkSize?: number, verbose?: boolean }) {
  const allFiles = argv.files || [].filter(f => typeof f === "string" && f.length);
  if (allFiles.length <= 0) {
    Terminal.writeln("file/files参数不能同时为空", COLOR_FOREGROUND.Yellow).reset();
    return;
  }
  allFiles.forEach(file => {
    if (!fs.existsSync(file)) {
      Terminal.writeln(`文件 ${file} 不存在`, COLOR_FOREGROUND.Yellow).reset();
      return;
    }
    const fileName = path.basename(file);

    fileToHash(file, argv.chunkSize, "hex").on("progress", ({ currentSize, totalSize }) => {
      argv.verbose && Terminal.writeln(`[${fileName}] ${(currentSize / totalSize).toFixed(2)} ${humanSize(currentSize).join("")}`);
    }).on("end", hash => {
      Terminal.write(`[${fileName}] `)
        .writeln(hash, COLOR_FOREGROUND.Green)
        .reset();
    });
  });
}