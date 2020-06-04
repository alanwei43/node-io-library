import { recursiveFiles } from "../../library";
import path from "path";

export const command = "tree [dir]";
export const desc = "列出目录树";
export const builder = {
  dir: {
    default: '.',
  }
};
export const handler = function (argv: any) {
  const baseDir = path.resolve(argv.dir);

  const files = recursiveFiles(argv.dir, {
    recursive: true,
    filter: item => item.path.indexOf("node_modules") === -1
  }).map(item => ({
    path: item.path.substr(baseDir.length + 1),
    size: item.stat.isFile() ? item.stat.size : "--"
  })).map(item => `${item.path}(${item.size})`);
  console.log(files.join("\n"));
}