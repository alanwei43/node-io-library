import { hashFiles, COLOR_FOREGROUND, copyFileSync, expandFileInfo, FileInfo, FilePathInfo, TerminalColor } from "../../library";
import path from "path";
import { Options } from "yargs";
import fs from "fs";
import readline from "readline";
import { promisify } from "util";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})


export const command = "tidy [source] [target]";
export const desc = "整理文件";
export const builder: { [key: string]: Options } = {
  source: {
    demandOption: true,
    description: "源目录"
  },
  target: {
    demandOption: false,
    description: "目标目录(不指定目标目录仅打印报告)",
    alias: "t"
  },
  output: {
    type: "string",
    demandOption: false,
    default: false,
    describe: "报告文件输出地址",
    alias: "o"
  },
  verbose: {
    type: "boolean",
    demandOption: false,
    default: false,
    describe: "是否输出详细日志",
    alias: "v"
  },
  "show-repeat-name": {
    type: "boolean",
    demandOption: false,
    default: false,
    describe: "是否报告文件名重复的文件"
  },
  "delete-repeat": {
    type: "string",
    demandOption: false,
    default: "false",
    describe: "删除重复文件(false:不删除, auto:自动删除, true:手动确认)",
    alias: "d"
  }
};
export const handler = function (argv: {
  source: string,
  target: string,
  output: string,
  verbose: boolean,
  showRepeatName: boolean,
  deleteRepeat: "auto" | "false" | "true"
}) {
  const Terminal = typeof argv.output === "string" && argv.output.length ? new TerminalColor(argv.output) : new TerminalColor();
  argv.verbose && Terminal.writeln("输入参数: ").writeln(JSON.stringify(argv, null, "  "));

  if (typeof argv.source !== "string" || argv.source.length === 0 || !fs.existsSync(argv.source)) {
    Terminal.writeln(`参数 source 不能为空, 且目录${argv.source}必须存在`, COLOR_FOREGROUND.Red);
    return;
  }

  const filesKeyByHash = new Map<string, Array<FilePathInfo>>();
  const filesKeyByName = new Map<string, Array<FilePathInfo>>();

  const hashResults = hashFiles(argv.source, {
    hash: {
      chunkSize: 1024 * 1024 * 1024
    },
    recursive: {
      recursive: true
    },
    callback: (file, hash) => {
      const srcFile = expandFileInfo(file.path, argv.source);

      (function fillHashMap() {
        if (!filesKeyByHash.has(hash)) {
          filesKeyByHash.set(hash, []);
        }
        filesKeyByHash.get(hash).push(srcFile);
      })();

      (function fillNameMap() {
        if (!filesKeyByName.has(srcFile.name.toLowerCase())) {
          filesKeyByName.set(srcFile.name.toLowerCase(), []);
        }
        filesKeyByName.get(srcFile.name.toLowerCase()).push(srcFile);
      })();


      const repeatedFiles = filesKeyByHash.get(hash);
      if (repeatedFiles.length > 1) {
        // 删除重复文件
        return new Promise(resolve => {
          function deleteFiles(files: Array<FilePathInfo>) {
            return files.reduce((prev, f) =>
              prev.then(() => promisify(fs.unlink)(f.path))
                .then(() => {
                  Terminal.color(COLOR_FOREGROUND.Green).writeln(`重复文件 ${f.path} 已删除`).reset();
                  repeatedFiles.splice(repeatedFiles.indexOf(f), 1);
                })
                .catch(err => {
                  Terminal.color(COLOR_FOREGROUND.Red).writeln(`重复文件 ${f.path} 删除失败: ${err}`).reset();
                })
              , Promise.resolve())
          }

          if (argv.deleteRepeat === "auto") {
            // 自动删除重复文件
            const skip1Files = repeatedFiles.sort((p, n) => p.name.length - n.name.length).slice(1); // 优先删除文件名短的
            deleteFiles(skip1Files).then(() => resolve());
            return;
          }
          if (argv.deleteRepeat === "true") {
            // 手动确认需要删除的重复文件
            rl.question(`输入需要删除的文件列表序号: \n${repeatedFiles.map((p, i) => `  [${i + 1}] ${p.path}`).join("\n")}\n`, numbers => {
              const willDeletedFiles = (numbers + "")
                .split(",")
                .map(n => parseInt(n))
                .filter(n => !isNaN(n))
                .map(n => n - 1)
                .map(n => repeatedFiles[n])
                .filter(f => !!f);

              deleteFiles(willDeletedFiles).then(() => resolve());
            });
            return;
          }

          resolve();
        });
      }
    }
  });
  Terminal.writeln(`[${argv.source}] 内文件 Hash 计算开始`);

  hashResults.on("data", (data: { file: FileInfo, hash: string }) => {
    const srcFile = expandFileInfo(data.file.path, argv.source);
    argv.verbose && Terminal.writeln(`[${new Date().toLocaleTimeString()}] ${data.hash} <- ${srcFile.name} `);
  });
  hashResults.on("end", () => {
    rl.close();

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

    /**
      * 执行文件拷贝
      */
    if (typeof argv.target === "string" && argv.target.length > 0) {
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
          target = expandFileInfo(path.join(argv.target, `${src.name} [${hash}]`), argv.target);
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
      return;
    }
  });
}