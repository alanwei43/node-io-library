import { recursiveDir, Terminal, COLOR_FOREGROUND, hashFile, expandFileInfo } from "../../library";
import { boolean, Options, string } from "yargs";
import path from "path";
import fs from "fs";
import { promisify } from "util";
import { pipeline } from "stream";

/**
 * base64 --file ./hello.png --target ./base64.txt 
 * base64 --file ./base64.txt --target ./hello.png --decode
 */

export const command = "base64 [file]";
export const desc = "将文件转成base64";
export const builder: { [key: string]: Options } = {
  file: {
    type: "string",
    demandOption: false,
    describe: "输入文件地址"
  },
  text: {
    type: "string",
    describe: "输入文本",
    alias: "t"
  },
  dest: {
    type: "string",
    demandOption: false,
    describe: "输出地址(默认源文件所在目录)",
    alias: "d"
  },
  decode: {
    type: "boolean",
    demandOption: false,
    default: false,
    describe: "执行解码(base64转文本)"
  },
  "html-image-prefix": {
    type: "boolean",
    demandOption: false,
    describe: "在base64前面追加 data:image/ext;base64, 字符"
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
  dest?: string,
  decode?: boolean,
  verbose?: boolean,
  htmlImagePrefix?: boolean
}) {

  argv.verbose && Terminal.writeln("输入参数: ")
    .writeln(JSON.stringify(argv, null, "  "), COLOR_FOREGROUND.Yellow)
    .newline()
    .reset();

  if (!argv.file && !argv.text) {
    Terminal.color(COLOR_FOREGROUND.Red).writeln("--file, --text 参数不能同时为空").newline().reset();
    process.exit();
  }

  if (argv.dest) {
    const dir = path.dirname(argv.dest);
    if (!fs.existsSync(dir)) {
      argv.verbose && Terminal.color(COLOR_FOREGROUND.Green).writeln(`创建目录 ${dir}`).newline().reset();
      fs.mkdirSync(dir, {
        recursive: true
      });
    }
  }

  if (argv.file) {
    // 输入内容为文件地址

    if (!fs.existsSync(argv.file)) {
      Terminal.color(COLOR_FOREGROUND.Red).writeln(`文件 ${argv.file} 不存在`).newline().reset();
      process.exit();
    }
    let target = argv.dest;
    if (!target) {
      target = `${argv.file}.${argv.decode ? "original" : "base64"}`;
      argv.verbose && Terminal.writeln(`目标目录未指定, 默认使用 ${target}`);
    }

    let converted: Buffer | string = null;
    const htmlImgPrefixReg: RegExp = /^data:(\w+)\/(\w+);base64, /ig
    if (argv.decode) {
      /**
       * 执行解码, 源文件内容为base64字符
       */
      let input: string = fs.readFileSync(argv.file, { encoding: "utf-8" });
      const match = htmlImgPrefixReg.exec(input);
      if (match && match.length === 3) {
        input = input.substr(match[0].length);
      }
      converted = Buffer.from(input, "base64");
    } else {
      /**
       * 读取源文件内容, 转成base64编码
       */
      let input: string = fs.readFileSync(argv.file).toString("base64");
      if (argv.htmlImagePrefix) {
        const ext = path.extname(argv.file).substr(1);
        input = `data:image/${ext};base64, ${input}`;
      }
      converted = input;
    }

    argv.verbose && Terminal.writeln(`开始将${converted.length}长度的内容写入到 ${target}`);
    fs.writeFileSync(target, converted);
    Terminal.color(COLOR_FOREGROUND.Green).writeln(`文件已写入到 ${target}`).reset();
  }

  if (argv.text) {
    // 输入内容为文本
    const result = argv.decode ? Buffer.from(argv.text, "base64").toString("utf-8") : Buffer.from(argv.text).toString("base64");
    console.log(`${argv.decode ? "解码后内容" : "编码后内容"}: `);
    console.log(result);
  }

  process.exit();
}
