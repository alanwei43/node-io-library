import { hashFiles, COLOR_FOREGROUND, copyFileSync, expandFileInfo, FileInfo, FilePathInfo, TerminalColor } from "../../library";
import path from "path";
import { Options } from "yargs";
import fs from "fs";


export const command = "flat [source] [target]";
export const desc = "将source目录下的文件展开复制到target根目录下";
export const builder: { [key: string]: Options } = {
  source: {
    required: true,
    description: "源目录"
  },
  target: {
    required: false,
    description: "目标目录(不指定目标目录仅打印报告)"
  },
  output: {
    type: "string",
    required: false,
    default: false,
    describe: "报告文件输出地址"
  },
  verbose: {
    type: "boolean",
    required: false,
    default: false,
    describe: "是否输出详细日志"
  },
  showRepeatName: {
    type: "boolean",
    required: false,
    default: false,
    describe: "是否报告文件名重复的文件"
  }
};
export const handler = function (argv: { source: string, target: string, output: string, verbose: boolean, showRepeatName: boolean }) {
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
    /**
     * 数量计算
     */
    let filesCount = 0, repeatCount = 0, repeatFilesCount = 0;
    filesKeyByHash.forEach((val, key) => {
      filesCount += val.length;
      if (val.length > 1) {
        repeatCount += 1;
        repeatFilesCount += val.length;
      }
    });

    Terminal.writeln(`[${argv.source}] 内文件 Hash 计算完成(总共${filesCount}个文件)`).writeln("开始输出报告...");

    if (filesKeyByHash.size === 0) {
      Terminal.writeln("No files").reset();
      return;
    }

    (function () {
      /**
       * 打印报告
       */
      Terminal.newline().writeln(`文件内容重复 (共${repeatCount}个文件有重复文件, 总重复文件数量为 ${repeatFilesCount - repeatCount}): `);
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

      if (argv.showRepeatName) {
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
      }
    })();
    if (typeof argv.target !== "string" || argv.target.length === 0) {
      /**
       * 如果没有目标目录, 仅打印重复文件报告.
       */
      return;
    }

    /**
      * 执行文件拷贝
      */
    Terminal.reset().writeln("开始根据报告拷贝文件...");
    if (!fs.existsSync(argv.target)) {
      Terminal.writeln(`创建目标目录 ${argv.target} `, COLOR_FOREGROUND.Yellow);
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