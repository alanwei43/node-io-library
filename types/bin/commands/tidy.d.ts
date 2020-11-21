import { Options } from "yargs";
export declare const command = "tidy [source] [target]";
export declare const desc = "\u6574\u7406\u6587\u4EF6";
export declare const builder: {
    [key: string]: Options;
};
export declare const handler: (argv: {
    source: string;
    target: string;
    output: string;
    verbose: boolean;
    showRepeatName: boolean;
    deleteRepeat: "auto" | "false" | "true";
}) => void;
