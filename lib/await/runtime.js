"use strict";

var util = require('../util');
var trace = console.error.bind(console);
var frameModule = require('../frame');

var setImmediate = typeof setImmediate === 'function' ? setImmediate : setTimeout;

// forceImmediate:
//	0 to disable
//	1 to force on every call
//	2 to force setImmediate instead of nextTick

var forceImmediate = 0; 
if (forceImmediate === 2 && typeof process !== 'undefined') process.nextTick = setImmediate;

var g = util.getGlobals('await');

var counters = {
	slowAwait: 0,
	fastAwait: 0,
};

function frameWrap(file, line, name, awaitFn) {
	return function() {
		// awaitFn is a function which returns a promise
		var frame = frameModule.pushFrame(file, line, name);
		var promise = awaitFn.apply(this, arguments);
		if (!(promise instanceof Promise)) {
			console.error("Expected a promise, got ", promise);
			process.exit();
		}
		frame.yield();
		var then = promise.then;
		promise.then = function(callback, errback, progress) {
			function wrapCb(callback) {
				if (!callback || !frame) return callback;
				return function(result) {
					var oldFrame = g.frame;
					g.frame = frame;
					if (frame) {
						frame.resume();
						frame.pop();
					}
					try {
						return callback.apply(this, arguments);
					} finally {
						g.frame = oldFrame;
					}				
				}
			}
			var oldFrame = g.frame;
			try {
				return then.call(this, wrapCb(callback), wrapCb(errback), progress);
			} finally {
				g.frame = oldFrame;
			}
		}
		promise.__frame = frame;
		//g.frame = frame;
		return promise;
	}
}

exports.await = function(file, line, object, property, index1, index2, returnArray) {
	var bound = typeof property !== "function";
	var fn = bound ? object[property] : property;
	if (typeof fn !== "function") throw util.typeError("cannot call", "function", fn);
	var key = '', wrapper;
	if (index2 == null && !returnArray) {
		key = 'promised-' + index1;
		wrapper = fn[key];
		if (wrapper) {
			counters.fastAwait++;
			wrapper = bound ? wrapper.bind(object) : wrapper;
			return g.emitter ? frameWrap(file, line, fn.name, wrapper) : wrapper;
		}
	}
	counters.slowAwait++;
	//if (counters.slowAwait % 50000 === 0) console.error(counters);
	wrapper = function() {
		var args = Array.prototype.slice.call(arguments),
			arg = args[index1];
		if (typeof arg !== 'boolean') throw util.argError(fn.name, index1, 'boolean', arg);
		var promise = new Promise(function(resolve, reject) {
			var callback = function(err, result) {
				if (returnArray && !err) result = Array.prototype.slice.call(arguments, 1);
				//if (sync) console.error("SYNC");
				if (sync || forceImmediate === 1) {
					setImmediate(function() {
						if (err) reject(err);
						else resolve(result);
					});
				} else {
					if (err) reject(err);
					else resolve(result);
				}
			};
			if (index2 != null) {
				args[index1] = function(r) { callback(null, r); }
				args[index2] = function(e) { callback(e); }
			} else {
				args[index1] = callback;
			}
		})
		var sync = true;
		fn.apply(bound ? object: this, args);
		sync = false;
		return promise;
	};
	if (!bound && key) {
		fn[key] = wrapper;
	}
	return g.emitter ? frameWrap(file, line, fn.name, wrapper) : wrapper;
};


exports.async = function(fn, index, arity) {
	if (typeof fn !== "function") throw util.typeError("cannot wrap function", "function", fn);
	var wrapper = function() {
		var self = this;
		var args = Array.prototype.slice.call(arguments);
		var cb = args[index];
		if (typeof cb !== "function") {
			if (g.allowBooleanPlaceholders && typeof cb === 'boolean') {
				if (cb) cb = util.defaultCallback;
				else return exports.future("", 0, null, wrapper.bind(this), index)(args);
			}
			else throw util.argError(fn.name, index, "function", typeof cb);
		}
		var cx = g.context;
		var oldFrame = g.frame;
		var frame = g.frame = null;
		var promise = fn.apply(this, args);
		g.frame = oldFrame;

		promise.then(function(result) {
			var oldFrame = g.frame;
			g.frame = frame;
			var oldContext = g.context;
			g.context = cx;
			try {
				cb.call(self, null, result);
			} finally {
				g.context = oldContext;
				g.frame = oldFrame;
			}
		}, function(err) {
			//trace && trace(err);
			var oldFrame = g.frame;
			g.frame = frame;
			var oldContext = g.context;
			g.context = cx;
			try {
				cb.call(self, err);
			} finally {
				g.context = oldContext;
				g.frame = oldFrame;
			}
		});
	};
	wrapper['promised-' + index] = fn;
	return wrapper;
}

exports.new = function(file, line, constructor, index) {
	if (typeof constructor !== "function") throw util.typeError("cannot instantiate", "function", constructor);
	return function() {
		var args = Array.prototype.slice.call(arguments);
		var that = Object.create(constructor.prototype);
		args[index] = true;
		return new Promise(function(resolve, reject) {
			exports.await(file, line, null, constructor, index, null, false).apply(that, args).then(function(result) {
				resolve(that);
			}, reject);
		});
	};
}

exports.future = require('../future');
require('./builtins');