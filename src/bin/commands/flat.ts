import { hashFiles, COLOR_FOREGROUND, copyFileSync, expandFileInfo, FileInfo, FilePathInfo, TerminalColor } from "../../library";
import path from "path";
import { Options } from "yargs";
import fs from "fs";

/**
 * flat src/ target/ --hash-name
 * flat src/ target/ --ignore-repeat-file
 * --report 
 */
export const command = "flat [source] [target]";
export const desc = "将source目录下的文件展开复制到target目录下";
export const builder: { [key: string]: Options } = {
  source: {
    required: true,
    description: "源文件目录"
  },
  target: {
    required: false,
    description: "目标目录"
  },
  report: {
    type: "boolean",
    required: false,
    default: false,
    describe: "仅输出报告"
  },
  output: {
    type: "string",
    required: false,
    default: false,
    describe: "报告输出文件地址"
  },
  verbose: {
    type: "boolean",
    required: false,
    default: false,
    describe: "是否输出详细日志"
  },
};
export const handler = function (argv: { source: string, target: string, report: boolean, output: string, verbose: boolean }) {
  const Terminal = typeof argv.output === "string" && argv.output.length ? new TerminalColor(argv.output) : new TerminalColor();
  argv.verbose && Terminal.writeln("输入参数: ").writeln(JSON.stringify(argv, null, "  "));

  if (typeof argv.source !== "string" || argv.source.length === 0 || !fs.existsSync(argv.source)) {
    Terminal.writeln(`参数 source 不能为空, 且目录${argv.source}必须存在`, COLOR_FOREGROUND.Red);
    return;
  }

  const hashResults = hashFiles(argv.source, {
    hash: {
      chunkSize: 1024 * 1024 * 1024
    },
    recursive: {
      recursive: true
    }
  });
  const filesKeyByHash = new Map<string, Array<FilePathInfo>>();
  const filesKeyByName = new Map<string, Array<FilePathInfo>>();
  Terminal.writeln(`[${argv.source}] 内文件 Hash 计算开始`);
  hashResults.on("data", (data: { file: FileInfo, hash: string }) => {
    const srcFile = expandFileInfo(data.file.path, argv.source);

    (function () {
      if (!filesKeyByHash.has(data.hash)) {
        filesKeyByHash.set(data.hash, []);
      }
      filesKeyByHash.get(data.hash).push(srcFile);
    })();

    (function () {
      if (!filesKeyByName.has(srcFile.name.toLowerCase())) {
        filesKeyByName.set(srcFile.name.toLowerCase(), []);
      }
      filesKeyByName.get(srcFile.name.toLowerCase()).push(srcFile);
    })();

    argv.verbose && Terminal.writeln(`${data.hash} <- ${srcFile.name} `);
  });
  hashResults.on("end", () => {
    Terminal.writeln(`[${argv.source}] 内文件 Hash 计算完成`).writeln("开始输出报告...");

    if (filesKeyByHash.size === 0) {
      Terminal.writeln("No files").reset();
      return;
    }
    if (argv.report) {
      /**
       * 仅打印重复文件报告
       */
      Terminal.newline().writeln(`文件内容重复 ${Array.from(filesKeyByHash.values()).filter(f => f.length > 1).length}: `);
      for (let [hash, repeatdFiles] of filesKeyByHash) {
        if (repeatdFiles.length === 1) {
          argv.verbose && Terminal.writeln(`[${hash}] ${repeatdFiles[0].path} 没有重复`)
          continue;
        }
        Terminal.newline()
          .writeln(`${hash} - ${repeatdFiles.length}`, COLOR_FOREGROUND.Yellow)
          .reset()
          .write("  ")
          .writeln(`${repeatdFiles.map(f => f.relative || f.path).join("\n  ")}`);
      }

      Terminal.newline().writeln(`文件名重复 ${Array.from(filesKeyByName.values()).filter(f => f.length > 1).length}: `);
      for (let [name, repeatdFiles] of filesKeyByName) {
        if (repeatdFiles.length === 1) {
          argv.verbose && Terminal.writeln(`[${name}] ${repeatdFiles[0].path} 没有重复`)
          continue;
        }
        Terminal.newline()
          .writeln(`${name} - ${repeatdFiles.length} `, COLOR_FOREGROUND.Yellow)
          .reset()
          .write("  ")
          .writeln(`${repeatdFiles.map(f => f.relative || f.path).join("\n  ")}`);
      }
      return;
    }

    Terminal.reset().writeln("开始根据报告拷贝文件...");
    /**
     * 执行文件拷贝
     */
    if (typeof argv.target !== "string" || argv.target.length === 0) {
      Terminal.writeln("target must be required", COLOR_FOREGROUND.Red);
      return;
    }
    if (!fs.existsSync(argv.target)) {
      Terminal.writeln(`Create destination directory: ${argv.target} `, COLOR_FOREGROUND.Yellow);
      fs.mkdirSync(argv.target, {
        recursive: true
      });
    }


    for (let [hash, repeatdFiles] of filesKeyByHash) {
      if (repeatdFiles.length === 0) {
        Terminal.writeln(`Hash (${hash}) no files`, COLOR_FOREGROUND.Red);
        continue;
      }
      const src = repeatdFiles[0];
      let target = expandFileInfo(path.join(argv.target, src.name), argv.target);
      if (fs.existsSync(target.path)) {
        target = expandFileInfo(path.join(argv.target, `[${hash}] ${src.name}`), argv.target);
      }

      Terminal.write(src.relative || src.path, COLOR_FOREGROUND.Green)
        .reset()
        .write(" -> ")
        .write(target.relative || target.path, COLOR_FOREGROUND.Green)
        .newline()
        .reset();

      copyFileSync(src.path, target.path, {
        override: true
      });
    }
    Terminal.reset().writeln("文件拷贝完成!");
  })
}