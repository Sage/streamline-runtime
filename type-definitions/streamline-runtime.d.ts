// StreamlineRuntime is defined as a class so that we get both a variable (the constructor) and a type
// when we import it. This trick minimizes the clutter in intellisense.
declare class StreamlineRuntime {
    future<R>(fn: (_: StreamlineRuntime) => R): (_: StreamlineRuntime) => R;
    promise<R>(fn: (_: StreamlineRuntime) => R): Promise<R>;
    flows: StreamlineFlows;
    context: any;
    runtime: string;
}

export default StreamlineRuntime;


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
