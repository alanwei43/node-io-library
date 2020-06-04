import { recursiveFiles } from "../../library";
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
    default: "node_modules|\\.git"
  }
};
export const handler = function (argv: any) {
  const baseDir = path.resolve(argv.dir);
  // console.log(`${argv.recursive ? "递归" : ""}列出${baseDir}目录下文件`);

  recursiveFiles(argv.dir, {
    recursive: argv.recursive,
    filter: item => !new RegExp(argv.ignore).test(item.path)
  }).forEach(item => {
    const path = item.path.substr(baseDir.length);
    console.log(`${path}(${item.stat.size})`);
  });
}