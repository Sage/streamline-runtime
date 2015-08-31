"use strict";

var util = require('./util');
var trace = console.error.bind(console);
var frameModule = require('./frame');

var setImmediate = typeof setImmediate === 'function' ? setImmediate : setTimeout;

// forceImmediate:
//	0 to disable
//	1 to force on every call
//	2 to force setImmediate instead of nextTick

var forceImmediate = 1; 
if (forceImmediate === 2 && typeof process !== 'undefined') process.nextTick = setImmediate;

var g = util.getGlobals('await');

var originalThen = Promise.prototype.then;
Promise.prototype.then = function() {
	var oldContext = g.context;
	g.context = this.__context;
	g.frame = this.__frame;
	if (this.__frame) {
		if (g.emitter) this.__frame.resume();
		this.__frame.pop();
		this.__frame = null;
	}
	var result = originalThen.apply(this, arguments);
	g.context = oldContext;
	return result;
}

var counters = {
	slowAwait: 0,
	fastAwait: 0,
	slowAsync: 0,
	fastAsync: 0,
};

function wrapPromise(file, line, name, wrapper, index) {
	return function() {
		var frame = frameModule.pushFrame(file, line, name);
		var promise = wrapper.apply(this, arguments);
		if (!(promise instanceof Promise)) {
			console.error("not a promise!");
			process.exit();
		}
		promise.__frame = frame;
		promise.__context = g.context;
		if (g.emitter) promise.__frame.yield();
		return promise;
	}
}

exports.await = function(file, line, object, property, index1, index2, returnArray) {
	var bound = typeof property !== "function";
	var fn = bound ? object[property] : property;
	if (typeof fn !== "function") throw util.typeError("cannot call", "function", fn);
	var key = 'awaitWrapper-' + index1 + '-' + index2 + '-' + returnArray;
	var wrapper = fn[key];
	if (wrapper) {
		counters.fastAwait++;
		wrapper = bound ? wrapper.bind(object) : wrapper;
		return g.emitter ? wrapPromise(file, line, fn.name, wrapper) : wrapper;
	}
	counters.slowAwait++;
	if (counters.slowAwait % 50000 === 0) console.error(counters);
	wrapper = function() {
		var args = Array.prototype.slice.call(arguments),
			arg = args[index1];
		if (typeof arg !== 'boolean') throw util.argError(fn.name, index1, 'boolean', arg);
		var promise = new Promise(function(resolve, reject) {
			var callback = function(err, result) {
				if (returnArray && !err) result = Array.prototype.slice.call(arguments, 1);
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
		promise.__frame = g.emitter ? frameModule.pushFrame(file, line, fn.name) : null;
		var sync = true;
		fn.apply(bound ? object: this, args);
		sync = false;
		promise.__context = g.context;
		if (g.emitter) promise.__frame.yield();
		return promise;
	};
	if (!bound) {
		fn[key] = wrapper;
		wrapper['asyncWrapper-' + index1] = fn;
	}
	return wrapper;
};


exports.async = function(fn, index) {
	if (typeof fn !== "function") throw util.typeError("cannot wrap function", "function", fn);
	var key = 'asyncWrapper-' + index;
	var wrapper = fn[key];
	if (wrapper) {
		counters.fastAsync++;
		return wrapper;
	}
	counters.slowAsync++;
	wrapper = function() {
		var self = this;
		var args = Array.prototype.slice.call(arguments);
		var cb = args[index];
		if (typeof cb !== "function") {
			// if cb is false, return a future
			//if (cb === false) return future(null, wrapper.bind(self), args);
			throw util.argError(fn.name, index, "function", typeof cb);
		}
		fn.apply(this, args).then(function(result) {
			cb.call(self, null, result);
		}, function(err) {
			//trace && trace(err);
			cb.call(self, err);
		});
	};
	wrapper['awaitWrapper-' + index + '-null-false'] = fn;
	fn[key] = wrapper;
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

exports.future = require('./future');