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
  .example("$0 tree ./", "递归列出当前目录下所有文件")
  .example("$0 tree ./ --hash", "递归列出当前目录下所有文件及其Hash")
  .example("$0 tree ./ --hash --file-filter 'js$'", "递归列出当前目录下所有js结尾文件及其Hash")
  .example("$0 flat ./", "打印当前目录及其子目录下所有重复文件")
  .example("$0 flat ./ --show-repeat-name", "打印当前目录及其子目录下所有内容和名称重复文件")
  .example("$0 flat src/ target/", "将src及其子目录下的所有文件复制到target根目录下, 并忽略重复文件")
  .argv;