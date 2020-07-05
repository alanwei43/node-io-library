import { Options } from "yargs";
export declare const command = "hash [files]";
export declare const desc = "\u8BA1\u7B97\u6307\u5B9A\u6587\u4EF6\u7684Hash\u503C";
export declare const builder: {
    [key: string]: Options;
};
export declare const handler: (argv: {
    files: Array<string>;
    chunkSize?: number;
    verbose?: boolean;
    from?: string;
    text?: string;
}) => void;
