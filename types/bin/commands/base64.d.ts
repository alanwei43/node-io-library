import { Options } from "yargs";
export declare const command = "base64 [file]";
export declare const desc = "\u5C06\u6587\u4EF6\u8F6C\u6210base64";
export declare const builder: {
    [key: string]: Options;
};
export declare const handler: (argv: {
    file?: string;
    text?: string;
    dest?: string;
    decode?: boolean;
    verbose?: boolean;
    htmlImagePrefix?: boolean;
}) => never;
