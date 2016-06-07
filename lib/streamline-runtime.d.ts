
declare namespace Streamline {
    interface _ {
        future<R>(fn: (_: Streamline._) => R): (_: Streamline._) => R;
        promise<R>(fn: (_: Streamline._) => R): Promise<R>;
        funnel<T>(_: Streamline._, body: (_: Streamline._) => T): T;
        collect(_: Streamline._, futures: ((_: Streamline._) => any)[]): any[];
        ignore: Streamline._;
        check: Streamline._;
        context: any;
        withContext<T extends Function>(body: T, context: any): T;
        handshake(): Handshake;
        queue<T>(max?: number): Queue<T>;
        sleep(_: Streamline._, millis: number): void;
        runtime: string;
    }
    interface Handshake {
        wait(_: Streamline._): void;
        notify(): void;
    }

    interface Queue<T> {
        read(_: Streamline._): T;
        write(_: Streamline._, item: T): any;
        put(item: T, force?: boolean): boolean;
        end(): void;
        peek(): T;
        contents(): T[];
        adjust(fn: (oldContents: T[]) => T[]): void;
        length: number;
    }
}

declare module "streamline-runtime" {
    export type _ = Streamline._;
    export const _: Streamline._;
}
// Promise then override, to get promise.then(_, _) working.

declare interface Promise<T> {
    then(_: Streamline._, __: Streamline._): T
}

// Additional Array methods
// For now don't advertize options object, only number arg
declare interface Array<T> {
    //forEach_(_: Streamline._, parallel: number, callbackFn: (_: Streamline._, value: T, index: number, array: T[]) => void, thisArg?: any): void;
    forEach_(_: Streamline._, callbackFn: (_: Streamline._, value: T, index: number, array: T[]) => void, thisArg?: any): void;
    //map_(_: Streamline._, parallel: number, callbackFn: (_: Streamline._, value: T, index: number, array: T[]) => T, thisArg?: any): T[];
    map_(_: Streamline._, callbackFn: (_: Streamline._, value: T, index: number, array: T[]) => T, thisArg?: any): T[];
    //filter_(_: Streamline._, parallel: number, callbackFn: (_: Streamline._, value: T, index: number, array: T[]) => any, thisArg?: any): T[];
    filter_(_: Streamline._, callbackFn: (_: Streamline._, value: T, index: number, array: T[]) => any, thisArg?: any): T[];
    every_(_: Streamline._, callbackFn: (_: Streamline._, value: T, index: number, array: T[]) => boolean, thisArg?: any): boolean;
    some_(_: Streamline._, callbackFn: (_: Streamline._, value: T, index: number, array: T[]) => boolean, thisArg?: any): boolean;
    reduce_<U>(_: Streamline._, callbackFn: (_: Streamline._, previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U, initialValue: U): U;
    reduceRight_<U>(_: Streamline._, callbackFn: (_: Streamline._, previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U, initialValue: U): U;
    sort_(_: Streamline._, compareFn?: (_: Streamline._, a: T, b: T) => number): this;
}
// Additional Func(ion method
declare interface Function {
    apply_(_: Streamline._, thisArg: any, argArray: any, index?: number): any;
}
