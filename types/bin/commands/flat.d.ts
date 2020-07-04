import { Options } from "yargs";
/**
 * flat src/ target/ --hash-name
 * flat src/ target/ --ignore-repeat-file
 * --report
 */
export declare const command = "flat [source] [target]";
export declare const desc = "\u5C06source\u76EE\u5F55\u4E0B\u7684\u6587\u4EF6\u5C55\u5F00\u590D\u5236\u5230target\u76EE\u5F55\u4E0B";
export declare const builder: {
    [key: string]: Options;
};
export declare const handler: (argv: {
    source: string;
    target: string;
    report: boolean;
    output: string;
    verbose: boolean;
}) => void;
