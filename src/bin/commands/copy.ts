import { recursiveDir, Terminal, COLOR_FOREGROUND, hashFile, expandFileInfo } from "../../library";
import { Options } from "yargs";
import path from "path";
import fs from "fs";
import { promisify } from "util";
import { pipeline } from "stream";

export const command = "copy [src] [target]";
export const desc = "拷贝文件";
export const builder: { [key: string]: Options } = {
  src: {
    demandOption: true,
    describe: "源目录"
  },
  target: {
    type: "string",
    demandOption: true,
    describe: "目标目录",
  },
  filter: {
    type: "string",
    demandOption: false,
    describe: "文件名过滤规则(不传默认全部)",
    alias: "f"
  },
  replace: {
    type: "string",
    demandOption: false,
    describe: "待替换的目标文件名",
  },
  recursive: {
    type: "boolean",
    default: true,
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
  src: string,
  target: string,
  filter?: string,
  replace?: string,
  recursive?: boolean,
  verbose?: boolean,
}) {

  function copy(s: string, t: string): Promise<any> {
    return promisify(fs.exists)(t)
      .then(exists => exists ? hashFile(t).then(hash => `${t}.[${hash}]`) : t) // 如果文件名已经存在文件名增加hash
      .then(target => promisify(pipeline)(fs.createReadStream(s), fs.createWriteStream(target)).then(() => target)) // 执行拷贝
      .then(target => Terminal.color(COLOR_FOREGROUND.Green).writeln(`文件 ${s} 拷贝到 ${target} 成功`).reset())
      .catch(err => Terminal.color(COLOR_FOREGROUND.Red).writeln(`文件 ${s} 拷贝失败: ${err}`).reset());
  }

  argv.verbose && Terminal.writeln("输入参数: ")
    .writeln(JSON.stringify(argv, null, "  "), COLOR_FOREGROUND.Yellow)
    .newline()
    .reset();

  if (!fs.existsSync(argv.target)) {
    Terminal.color(COLOR_FOREGROUND.Green).writeln(`目标目录不存在, 创建目录 ${argv.target}`).reset();
    fs.mkdirSync(argv.target, {
      recursive: true
    });
  }

  recursiveDir(argv.src, {
    recursive: argv.recursive,
    fileFilter: f => {
      const match = argv.filter ? new RegExp(argv.filter, "gi").test(expandFileInfo(f).name) : true;
      argv.verbose && Terminal.color(COLOR_FOREGROUND.Blue).writeln(`${f} 文件正则匹配 ${match ? "通过" : "失败"}`).reset();
      return match;
    }
  }).filter(item => item.stat.isFile())
    .map(item => expandFileInfo(item.path))
    .reduce((prev, next) => prev.then(() => {
      let fileName = next.name;
      if (argv.filter && typeof argv.replace === "string" && argv.replace.length) {
        fileName = fileName.replace(new RegExp(argv.filter, "gi"), argv.replace) || fileName;
        argv.verbose && Terminal.color(COLOR_FOREGROUND.Blue).writeln(`源文件名: ${next.name}, 目标文件名: ${fileName}`).reset();
      }
      const target = path.join(argv.target, fileName);
      return copy(next.path, target);
    }), Promise.resolve())
    .then(() => {
      Terminal.color(COLOR_FOREGROUND.Green).writeln("执行完毕").reset();
      process.exit();
    });
}