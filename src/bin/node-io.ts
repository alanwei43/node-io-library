#!/usr/bin/env node

import yargs from "yargs";

yargs.commandDir("commands", {
  recurse: true,
  extensions: ["js", "ts"]
}).demandCommand()
  .version()
  .help()
  .argv;