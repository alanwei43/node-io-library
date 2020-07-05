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
    array: true,
    alias: "f"
  },
  from: {
    required: false,
    type: "string",
    describe: "包含文件列表的文件地址"
  },
  chunkSize: {
    required: false,
    type: "number",
    describe: "每次读取的字节数",
    default: 1024 * 1024 * 100,
    alias: "s"
  },
  verbose: {
    required: false,
    type: "boolean",
    default: false,
    alias: "v",
    describe: "是否显示进度"
  }
};

export const handler = function (argv: { files: Array<string>, chunkSize?: number, verbose?: boolean, from?: string }) {
  const allFiles = argv.files || [].filter(f => typeof f === "string" && f.length);
  if (typeof argv.from === "string" && argv.from.length && fs.existsSync(argv.from)) {
    const filesList = fs.readFileSync(argv.from, {
      encoding: "utf-8"
    }).split("\n")
      .map(line => line.trim())
    allFiles.splice(allFiles.length, 0, ...filesList);
  }
  const avaiableFiles = allFiles.filter(f => {
    const pass = typeof f === "string" && f.length && fs.existsSync(f) && fs.statSync(f).isFile();
    argv.verbose && Terminal.writeln(`${pass ? "通过" : "忽略"} [${f}]`, pass ? COLOR_FOREGROUND.Green : COLOR_FOREGROUND.Yellow).reset();
    return pass;
  });
  if (avaiableFiles.length <= 0) {
    Terminal.writeln("没有有效的输入文件", COLOR_FOREGROUND.Yellow).reset();
    return;
  }
  avaiableFiles.forEach(file => {
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