import { Options } from "yargs";
export declare const command = "copy [src] [target]";
export declare const desc = "\u62F7\u8D1D\u6587\u4EF6";
export declare const builder: {
    [key: string]: Options;
};
export declare const handler: (argv: {
    src: string;
    target: string;
    filter?: string;
    recursive?: boolean;
    verbose?: boolean;
}) => void;
