
import StreamlineRuntime from "streamline-runtime";

declare interface Array<T> {
    forEach_: (_: StreamlineRuntime, fn: (_: StreamlineRuntime, elt: T, index: number) => void) => void;
    map_: (_: StreamlineRuntime, fn: (_: StreamlineRuntime, elt: T, index: number) => T) => Array<T>;
}

declare module "fs" {
    export function readFile(path: string, encoding: string, _: StreamlineRuntime) : string;
    export function readFile(path: string, _: StreamlineRuntime) : Buffer;
    export function writeFile(path: string, data: Buffer, _: StreamlineRuntime) : void;
    export function writeFile(path: string, data: string, encoding: string, _: StreamlineRuntime) : void;
    export function readdir(path: string, _: StreamlineRuntime) : string[];
}