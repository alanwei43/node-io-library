import { Terminal, COLOR_FOREGROUND } from "../../library";
import { Options } from "yargs";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import { pipeline } from "stream";
import fetch from "node-fetch";
import { parse } from "url";
const pipelinePromise = promisify(pipeline);

/**
 * node-io download http://www.baidu.com
 */

export const command = "download [url] [dest]";
export const desc = "将文件转成base64";
export const builder: { [key: string]: Options } = {
    url: {
        type: "string",
        demandOption: true,
        describe: "URL地址"
    },
    dest: {
        type: "string",
        demandOption: false,
        describe: "输出地址(默认源文件所在目录)",
    },
    verbose: {
        type: "boolean",
        demandOption: false,
        default: false,
        alias: "v"
    }
};
export const handler = async function (argv: {
    url?: string,
    dest?: string,
    verbose?: boolean
}) {
    argv.verbose && Terminal.writeln("输入参数: ")
        .writeln(JSON.stringify(argv, null, "  "), COLOR_FOREGROUND.Yellow)
        .newline()
        .reset();

    if (!argv.dest) {
        const ext = path.extname(parse(argv.url).pathname) || "";
        argv.dest = Date.now().toString(16) + ext;
    }

    const response = await fetch(argv.url);
    await pipelinePromise(response.body, fs.createWriteStream(argv.dest));
    Terminal.writeln(`内容已保存至 ${path.resolve(argv.dest)}`).reset();
    process.exit();
}
