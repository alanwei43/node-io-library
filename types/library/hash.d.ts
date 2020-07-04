/// <reference types="node" />
import { EventEmitter } from "events";
import { RecursiveOptions } from "./io-recursive";
export interface HashFileOptions {
    chunkSize?: number;
}
export declare function hashFile(filePath: string, options?: HashFileOptions): Promise<string>;
export declare function hashFiles(dir: string, options: {
    hash?: HashFileOptions;
    recursive?: RecursiveOptions;
}): EventEmitter;
