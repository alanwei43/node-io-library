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
export const desc = "下载链接内容到本地";
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

    const response = await fetch(argv.url);
    if (!response.ok) {
        Terminal.color(COLOR_FOREGROUND.Red).writeln(`内容下载失败: ${response.statusText}`).reset();
        process.exit();
    }

    if (!argv.dest) {
        argv.verbose && Terminal.writeln("没有指定保存地址, 尝试使用随机文件名.");
        const contentType: string = response.headers.get("Content-Type") + "";
        argv.verbose && Terminal.writeln(`响应头Content-Type: ${contentType}`);
        let ext: string = path.extname(parse(argv.url).pathname) || "";
        argv.verbose && Terminal.writeln(`从URL解析扩展名: ${ext}`);
        if (!ext && /^\w+\/(\w+).*/.test(contentType)) {
            ext = contentType.replace(/^\w+\/(\w+).*/, "$1");
            argv.verbose && Terminal.writeln(`Content-Type解析扩展名: ${ext}`);
        }
        if (ext && ext[0] !== ".") {
            ext = "." + ext;
        }
        argv.dest = Date.now().toString(16) + ext;
        argv.verbose && Terminal.writeln(`最终解析路径: ${argv.dest}`);
    }

    await pipelinePromise(response.body, fs.createWriteStream(argv.dest));
    Terminal.color(COLOR_FOREGROUND.Green).writeln(`内容已保存至 ${path.resolve(argv.dest)}`).reset();
    process.exit();
}
