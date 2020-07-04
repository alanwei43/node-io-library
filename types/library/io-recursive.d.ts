/// <reference types="node" />
import fs from "fs";
export interface FileInfo {
    /**
     * 文件地址
     */
    path: string;
    /**
     * 文件状态
     */
    stat: fs.Stats;
}
export interface RecursiveOptions {
    /**
     * 是否递归子目录
     */
    recursive?: boolean;
    /**
     * 是否深度优先
     */
    deepFirst?: boolean;
    /**
     * 目录过滤
     */
    dirFilter?: (dir: string) => boolean;
    /**
     * 文件过滤
     */
    fileFilter?: (file: string) => boolean;
}
export declare function recursiveDir(rootDir: string, options?: RecursiveOptions): Array<FileInfo>;
