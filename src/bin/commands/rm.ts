import { recursiveDir, Terminal, COLOR_FOREGROUND, expandFileInfo } from "../../library";
import { Options } from "yargs";
import fs from "fs";
import readline from "readline";
import { promisify } from "util";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

export const command = "rm [dir]";
export const desc = "删除文件";
export const builder: { [key: string]: Options } = {
  dir: {
    default: "./",
    describe: "目录"
  },
  filter: {
    type: "string",
    demandOption: true,
    describe: "文件名过滤规则",
    alias: "f"
  },
  "filter-type": {
    type: "string",
    demandOption: false,
    default: "reg",
    describe: "filter参数值类型(reg:正则表达式,fn:函数)"
  },
  force: {
    type: "boolean",
    demandOption: false,
    default: false,
    describe: "是否自动删除"
  },
  print: {
    type: "boolean",
    demandOption: false,
    default: false,
    describe: "是否仅打印信息(不执行删除)"
  },
  recursive: {
    type: "boolean",
    default: false,
    describe: "是否递归子目录",
    alias: "r"
  },
  verbose: {
    type: "boolean",
    required: false,
    default: false,
    describe: "是否输出调试信息",
    alias: "v"
  }
};
export const handler = function (argv: {
  dir: string,
  filter?: string,
  filterType?: "reg" | "fn",
  force?: boolean,
  print?: boolean,
  recursive?: boolean,
  verbose?: boolean,
}) {

  function rm(filePath: string): Promise<any> {
    return promisify(fs.unlink)(filePath)
      .then(() => Terminal.color(COLOR_FOREGROUND.Green).writeln(`文件 ${filePath} 删除成功`).reset())
      .catch(err => Terminal.color(COLOR_FOREGROUND.Red).writeln(`文件 ${filePath} 删除失败: ${err}`).reset());
  }

  argv.verbose && Terminal.writeln("输入参数: ")
    .writeln(JSON.stringify(argv, null, "  "), COLOR_FOREGROUND.Yellow)
    .newline()
    .reset();

  if (typeof argv.filter !== "string" || argv.filter.length <= 0) {
    Terminal.color(COLOR_FOREGROUND.Red).writeln("filter参数必须是有效的字符串");
    return;
  }
  if (!["fn", "reg"].includes(argv.filterType)) {
    Terminal.color(COLOR_FOREGROUND.Red).writeln("--filter-type 参数必须是fn或者reg");
    return;
  }

  recursiveDir(argv.dir, {
    recursive: argv.recursive,
    fileFilter: f => {
      const fileName = expandFileInfo(f).name;
      if (argv.filterType === "reg") {
        return new RegExp(argv.filter, "gi").test(fileName);
      }
      if (argv.filterType === "fn") {
        return !!new Function(argv.filter).apply(fileName);
      }
      return false;
    }
  }).filter(item => item.stat.isFile())
    .reduce((prev, next) => prev.then(() => {
      if (argv.print) {
        Terminal.color(COLOR_FOREGROUND.Green).writeln(`匹配到文件 ${next.path}`).reset();
        return;
      }

      if (argv.force) {
        // 自动删除
        return rm(next.path);
      }
      return new Promise(resolve => {
        rl.question(`是否删除文件 ${next.path} (输入yes或y确认删除)?\n`, answer => {
          (answer + "").trim() === "yes" ? rm(next.path).then(() => resolve()) : resolve();
        });
      });
    }), Promise.resolve())
    .then(() => {
      Terminal.color(COLOR_FOREGROUND.Green).writeln("执行完毕").reset();
      process.exit();
    });
}