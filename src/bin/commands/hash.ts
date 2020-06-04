import { recursiveFiles } from "../../library";
import path from "path";
import { Options } from "yargs";

export const command = "hash [dir]";
export const desc = "";
export const builder: { [key: string]: Options } = {
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



/**
import { hashFile, hashFiles } from "../library";

const hub = hashFiles("/Users/alan/workspace/temporary/Music", {
  recursive: {
    filter: item => item.path.indexOf("AlbumArt") === -1,
    recursive: true
  },
  hash: {
    chunkSize: 1024 * 1024
  }
});
hub.on("log", data => {
  console.log(data.status, data.file.path);
})
hub.on("data", data => {
  console.log(data.hash, data.file.path);
});
 */