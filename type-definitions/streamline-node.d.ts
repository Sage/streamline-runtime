
// just an embryo - for testing
declare module "fs" {
    import StreamlineRuntime from "streamline-runtime";
    export function readFile(path: string, encoding: string, _: StreamlineRuntime) : string;
    export function readFile(path: string, _: StreamlineRuntime) : Buffer;
    export function writeFile(path: string, data: Buffer, _: StreamlineRuntime) : void;
    export function writeFile(path: string, data: string, encoding: string, _: StreamlineRuntime) : void;
    export function readdir(path: string, _: StreamlineRuntime) : string[];
}