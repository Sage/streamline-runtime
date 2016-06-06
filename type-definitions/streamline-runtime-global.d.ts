// Promise then override, to get promise.then(_, _) working.
import StreamlineRuntime from "streamline-runtime";

declare interface Promise<T> {
    then(_: StreamlineRuntime, __: StreamlineRuntime): T
}

// Additional Array methods
// For now don't advertize options object, only number arg
declare interface Array<T> {
    forEach_(_: StreamlineRuntime, parallel: number, callbackFn: (_: StreamlineRuntime, value: T, index: number, array: T[]) => void, thisArg?: any): void;
    forEach_(_: StreamlineRuntime, callbackFn: (_: StreamlineRuntime, value: T, index: number, array: T[]) => void, thisArg?: any): void;
    map_(_: StreamlineRuntime, parallel: number, callbackFn: (_: StreamlineRuntime, value: T, index: number, array: T[]) => T, thisArg?: any): T[];
    map_(_: StreamlineRuntime, callbackFn: (_: StreamlineRuntime, value: T, index: number, array: T[]) => T, thisArg?: any): T[];
    filter_(_: StreamlineRuntime, parallel: number, callbackFn: (_: StreamlineRuntime, value: T, index: number, array: T[]) => any, thisArg?: any): T[];
    filter_(_: StreamlineRuntime, callbackFn: (_: StreamlineRuntime, value: T, index: number, array: T[]) => any, thisArg?: any): T[];
    every_(_: StreamlineRuntime, callbackFn: (_: StreamlineRuntime, value: T, index: number, array: T[]) => boolean, thisArg?: any): boolean;
    some_(_: StreamlineRuntime, callbackFn: (_: StreamlineRuntime, value: T, index: number, array: T[]) => boolean, thisArg?: any): boolean;
    reduce_<U>(_: StreamlineRuntime, callbackFn: (_: StreamlineRuntime, previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U, initialValue: U): U;
    reduceRight_<U>(_: StreamlineRuntime, callbackFn: (_: StreamlineRuntime, previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U, initialValue: U): U;
    sort_(_: StreamlineRuntime, compareFn?: (_: StreamlineRuntime, a: T, b: T) => number): this;
}
// Additional Func(ion method
declare interface Function {
    apply_(_: StreamlineRuntime, thisArg: any, argArray: any, index?: number): any;
}
