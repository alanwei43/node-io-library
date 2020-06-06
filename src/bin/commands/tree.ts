import { recursiveFiles, humanSize, Terminal, COLOR_FOREGROUND, COLOR_BACKGROUND } from "../../library";
import path from "path";
import { Options } from "yargs";

export const command = "tree [dir]";
export const desc = "列出目录树";
export const builder: { [key: string]: Options } = {
  dir: {
    default: "./",
    alias: "d",
    describe: "目录"
  },
  recursive: {
    default: true,
    alias: "r",
    describe: "是否递归"
  },
  ignore: {
    // default: "node_modules|\\.git"
    required: false
  },
  include: {
    // default: ".*"
    required: false
  }
};
export const handler = function (argv: any) {
  const baseDir = path.resolve(argv.dir);
  console.warn(`${baseDir}${argv.recursive ? "/*" : ""}`);

  recursiveFiles(argv.dir, {
    recursive: argv.recursive,
    filter: item => {
      if (argv.ignore && new RegExp(argv.ignore, "i").test(item.path)) {
        return false;
      }
      if (argv.include) {
        return new RegExp(argv.include, "i").test(item.path);
      }
      return true;
    }
  }).filter(item => item.stat.isFile()).forEach(item => {
    const itemPath = item.path.substr(baseDir.length + 1);
    Terminal
    .write(`  ${itemPath}`)
    .color(COLOR_FOREGROUND.Green)
    .bg(COLOR_BACKGROUND.White)
    .write(` (${humanSize(item.stat.size).join(" ")})`)
    .newline()
    .reset();
  });
}