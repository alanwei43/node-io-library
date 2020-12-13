import { Options } from "yargs";
/**
 * node-io download http://www.baidu.com
 */
export declare const command = "download [url] [dest]";
export declare const desc = "\u4E0B\u8F7D\u94FE\u63A5\u5185\u5BB9\u5230\u672C\u5730";
export declare const builder: {
    [key: string]: Options;
};
export declare const handler: (argv: {
    url?: string;
    dest?: string;
    verbose?: boolean;
}) => Promise<never>;
