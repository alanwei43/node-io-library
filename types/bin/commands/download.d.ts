import { Options } from "yargs";
/**
 * node-io download http://www.baidu.com
 */
export declare const command = "download [url] [dest]";
export declare const desc = "\u5C06\u6587\u4EF6\u8F6C\u6210base64";
export declare const builder: {
    [key: string]: Options;
};
export declare const handler: (argv: {
    url?: string;
    dest?: string;
    verbose?: boolean;
}) => Promise<never>;
