// StreamlineRuntime is defined as a class so that we get both a variable (the constructor) and a type
// when we import it. This trick minimizes the clutter in intellisense.
declare class StreamlineRuntime {
    future<R>(fn: (_: StreamlineRuntime) => R): (_: StreamlineRuntime) => R;
    promise<R>(fn: (_: StreamlineRuntime) => R): Promise<R>;
    flows: StreamlineFlows;
    context: any;
    runtime: string;
}

declare module "streamline-runtime" {
    export default StreamlineRuntime;
}

// Promise then override, to get promise.then(_, _) working.
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

declare interface StreamlineHandshake {
	wait(_: StreamlineRuntime): void;
	notify(): void;
}

declare interface StreamlineQueue<T> {
	read(_: StreamlineRuntime): T;
	write(_: StreamlineRuntime, item: T): any;
	put(item: T, force?: boolean): boolean;
	end(): void;
	peek(): T;
    contents(): T[];
    adjust(fn: (oldContents: T[]) => T[]): void;
    length: number;
}

declare interface StreamlineFlows {
    funnel<T>(_: StreamlineRuntime, body: (_: StreamlineRuntime) => T): T;
    handshake(): StreamlineHandshake;
    queue<T>(max?: number): StreamlineQueue<T>;
    collect(_: StreamlineRuntime, futures: ((_: StreamlineRuntime) => any)[]): any[];
    sleep(_: StreamlineRuntime, millis: number): void;
    withContext<T extends Function>(body: T, context: any): T;
    ignore: StreamlineRuntime;
    check: StreamlineRuntime;
}
