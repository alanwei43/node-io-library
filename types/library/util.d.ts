/// <reference types="node" />
import { EventEmitter } from "events";
export declare function eventToPromise<T>(emitter: EventEmitter, eventNames?: {
    onData: string;
    onEnd: string;
    onError: string;
}): Promise<T[]>;
export declare function repeat<T>(count: number, char: T): Array<T>;
export declare function range(start: number, end: number): Array<number>;
export declare function humanSize(size: number): [number, string];
export declare function copyFileSync(src: string, dest: string, options?: {
    chunkSize?: number;
    override?: boolean;
}): "src_no_existed" | "dest_existed" | null;
export interface FilePathInfo {
    /**
     * 文件/目录地址
     */
    path: string;
    /**
     * 文件所在目录/目录的父级目录
     */
    dir: string;
    /**
     * 文件名/目录名
     */
    name: string;
    /**
     * 文件扩展名
     */
    ext: string;
    /**
     * 文件名(不带扩展名)
     */
    nameWithoutExt: string;
    /**
     * 相对目录地址
     */
    relative?: string;
}
export declare function expandFileInfo(fileOrDir: string, baseDir?: string): FilePathInfo;
export declare function readPkg(): {
    name: string;
    version: string;
};
