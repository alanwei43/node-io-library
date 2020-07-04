import { Options } from "yargs";
export declare const command = "tree [dir]";
export declare const desc = "\u76EE\u5F55\u6811";
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
