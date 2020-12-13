import { Options } from "yargs";
export declare const command = "rm [dir]";
export declare const desc = "\u5220\u9664\u6587\u4EF6";
export declare const builder: {
    [key: string]: Options;
};
export declare const handler: (argv: {
    dir: string;
    filter?: string;
    filterType?: "reg" | "fn";
    force?: boolean;
    test?: boolean;
    recursive?: boolean;
    verbose?: boolean;
}) => void;
