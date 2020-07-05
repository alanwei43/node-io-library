import { recursiveDir, humanSize, Terminal, COLOR_FOREGROUND, COLOR_BACKGROUND, hashFile, getColorPairs } from "../../library";
import { Options } from "yargs";
import path from "path";

export const command = "tree [dir]";
export const desc = "递归列出dir目录下文件";
export const builder: { [key: string]: Options } = {
  dir: {
    default: "./",
    describe: "目录"
  },
  recursive: {
    type: "boolean",
    default: true,
    describe: "是否递归子目录",
    alias: "r"
  },
  "dir-filter": {
    type: "string",
    required: false,
    describe: "目录过滤(正则表达式)"
  },
  "file-filter": {
    type: "string",
    required: false,
    describe: "文件过滤(正则表达式)"
  },
  hash: {
    type: "boolean",
    required: false,
    describe: "是否输出文件的Hash值"
  },
  verbose: {
    type: "boolean",
    required: false,
    default: false,
    describe: "是否输出调试信息",
    alias: "v"
  },
  colorful: {
    type: "boolean",
    required: false,
    default: false,
    alias: "c",
    describe: "是否使用不同颜色区分文件扩展名"
  }
};
export const handler = function (argv: { dir: string, recursive?: boolean, fileFilter?: string, dirFilter?: string, hash?: boolean, verbose?: boolean, colorful?: boolean }) {
  argv.verbose && Terminal.writeln("输入参数: ")
    .writeln(JSON.stringify(argv, null, "  "), COLOR_FOREGROUND.Yellow)
    .newline()
    .reset();

  const allFiles = recursiveDir(argv.dir, {
    recursive: argv.recursive,
    dirFilter: f => {
      if (typeof argv.dirFilter === "string" && argv.dirFilter.length) {
        const pass = (new RegExp(argv.dirFilter, "i")).test(f);
        argv.verbose && Terminal.color(pass ? COLOR_FOREGROUND.Green : COLOR_FOREGROUND.Yellow)
          .write(`${pass ? "通过" : "忽略"} `)
          .writeln(f)
          .reset();
        return pass;
      }
      return true;
    },
    fileFilter: f => {
      if (typeof argv.fileFilter === "string" && argv.fileFilter.length) {
        const pass = (new RegExp(argv.fileFilter, "i")).test(f);
        argv.verbose && Terminal.color(pass ? COLOR_FOREGROUND.Green : COLOR_FOREGROUND.Yellow)
          .write(`${pass ? "通过" : "忽略"} `)
          .writeln(f)
          .reset();
        return pass;
      }
      return true;
    }
  }).filter(item => item.stat.isFile());
  const promises = argv.hash ? Promise.all(allFiles.map(f => hashFile(f.path).then(hashValue => ({
    hash: hashValue,
    file: f
  })))) : Promise.resolve(allFiles.map(f => ({
    hash: null,
    file: f
  })));
  promises.then(all => {
    all.forEach(({ file, hash }) => {
      const colors = argv.colorful ? getColorPairs(path.extname(file.path).replace(".", "").length) : { fg: null, bg: null };
      Terminal
        .writeln(`${hash ? "[" + hash + "]" : ""} ${file.path} (${humanSize(file.stat.size).join(" ")})`, colors.fg, colors.bg)
        .reset();
    });
  })

}