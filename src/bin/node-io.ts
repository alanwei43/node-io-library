#!/usr/bin/env node

import yargs from "yargs";
import { readPkg } from "../library/util";

yargs.commandDir("commands", {
  recurse: true,
  extensions: ["js", "ts"]
}).demandCommand()
  .version("version", "显示版本号", readPkg().version)
  .help("help", "显示帮助")
  .example("$0 hash file1", "计算文件file1的Hash值")
  .example("$0 hash -f file1 file2", "计算文件file1和file2的Hash值")
  .example("$0 hash --text 'Hello world.'", "计算文本的Hash值")
  .example("find . > files && $0 hash --from files", "计算当前目录下所有文件Hash")
  .example("$0 tree ./", "递归当前目录所有文件")
  .example("$0 tree ./ --hash", "递归当前目录所有文件及其Hash")
  .example("$0 tree ./ -c", "根据扩展名使用不同颜色输出")
  .example("$0 tree ./ --hash --file-filter 'js$'", "递归当前目录下所有js结尾文件及其Hash")
  .example("$0 tidy ./", "递归打印当前目录所有重复文件")
  .example("$0 tidy ./ --show-repeat-name", "递归当前目录所有内容和名称重复文件")
  .example("$0 tidy src/ target/", "将src及其子目录下的所有文件复制到target根目录下并忽略重复文件")
  .example("$0 tidy src/ --delete-repeat true", "手动确认删除src及其子目录下重复文件")
  .example("$0 tidy src/ --delete-repeat auto", "自动删除src及其子目录下重复文件")
  .example(`$0 rm src/ -f "\\.js$" -r`, "删除src目录及其子目录下js文件")
  .argv;