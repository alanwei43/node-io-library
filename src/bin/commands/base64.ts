import { recursiveDir, Terminal, COLOR_FOREGROUND, hashFile, expandFileInfo } from "../../library";
import { boolean, Options } from "yargs";
import path from "path";
import fs from "fs";
import { promisify } from "util";
import { pipeline } from "stream";

/**
 * base64 --file ./hello.png --target ./base64.txt 
 * base64 --file ./base64.txt --target ./hello.png --decode
 */

export const command = "base64";
export const desc = "将文件转成base64";
export const builder: { [key: string]: Options } = {
  file: {
    type: "string",
    demandOption: false,
    describe: "源文件",
    alias: "f"
  },
  text: {
    type: "string",
    describe: "base64"
  },
  target: {
    type: "string",
    demandOption: false,
    describe: "输出地址",
    alias: "t"
  },
  decode: {
    type: "boolean",
    demandOption: false,
    default: false,
    alias: "d"
  },
  verbose: {
    type: "boolean",
    demandOption: false,
    default: false,
    alias: "v"
  }
};
export const handler = function (argv: {
  file?: string,
  text?: string,
  target?: string,
  decode?: boolean,
  verbose?: boolean,
}) {

  argv.verbose && Terminal.writeln("输入参数: ")
    .writeln(JSON.stringify(argv, null, "  "), COLOR_FOREGROUND.Yellow)
    .newline()
    .reset();

  if (!argv.file && !argv.text) {
    Terminal.color(COLOR_FOREGROUND.Red).writeln("--file, --text 参数不能同时为空").newline().reset();
    return;
  }

  // if (argv.decode) {
  //   const base64: string = fs.readFileSync(argv.file, {
  //     encoding: "utf-8"
  //   });
  //   saveData = Buffer.from(base64, "base64");
  // } 

  let base64: string;
  if (argv.file) {
    if (!fs.existsSync(argv.file)) {
      console.log(`文件 ${argv.file} 不存在`);
      return;
    }

    base64 = fs.readFileSync(argv.file).toString("base64");
  }
  if (argv.text) {
    base64 = Buffer.from(argv.text).toString("base64");
  }

  if (!argv.target) {
    console.log(`buffer: `);
    console.log(base64);
  } else {
    console.log(`buffer save to ${argv.target}`);
    const dir = path.dirname(argv.target);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {
        recursive: true
      });
    }
    fs.writeFileSync(argv.target, base64, { encoding: "utf8" });
  }
  process.exit();
}