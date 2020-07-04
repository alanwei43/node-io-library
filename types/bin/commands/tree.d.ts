import { Options } from "yargs";
export declare const command = "tree [dir]";
export declare const desc = "\u9012\u5F52\u5217\u51FAdir\u76EE\u5F55\u4E0B\u6587\u4EF6";
export declare const builder: {
    [key: string]: Options;
};
export declare const handler: (argv: {
    dir: string;
    recursive: boolean;
    fileFilter: string;
    dirFilter: string;
    hash: boolean;
    verbose: boolean;
}) => void;
