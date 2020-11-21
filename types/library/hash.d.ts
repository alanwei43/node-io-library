/// <reference types="node" />
import crypto from "crypto";
import { EventEmitter } from "events";
import { RecursiveOptions, FileInfo } from "./io-recursive";
export interface HashFileOptions {
    chunkSize?: number;
}
export declare function fileToHash(filePath: string, chunkSize: number, digestEncode: crypto.HexBase64Latin1Encoding): EventEmitter;
export declare function hashFile(filePath: string, options?: HashFileOptions): Promise<string>;
export declare function hashFiles(dir: string, options: {
    hash?: HashFileOptions;
    recursive?: RecursiveOptions;
    callback?: (file: FileInfo, hash: string) => Promise<void>;
}): EventEmitter;
