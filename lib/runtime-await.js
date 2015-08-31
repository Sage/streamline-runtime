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

var counters = {
	slowAwait: 0,
	fastAwait: 0,
	slowAsync: 0,
	fastAsync: 0,
};

exports.await = function(file, line, object, property, index1, index2, returnArray) {
	var bound = typeof property !== "function";
	var fn = bound ? object[property] : property;
	if (typeof fn !== "function") throw util.typeError("cannot call", "function", fn);
	var key = 'awaitWrapper-' + index1 + '-' + index2 + '-' + returnArray;
	var wrapper = fn[key];
	if (wrapper) {
		counters.fastAwait++;
		wrapper = bound ? wrapper.bind(object) : wrapper;
		return g.emitter ? frameModule.wrap(file, line, wrapper) : wrapper;
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
		var sync = true;
		fn.apply(bound ? object: this, args);
		sync = false;
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
		var cx = g.context;
		fn.apply(this, args).then(function(result) {
			var oldContext = g.context;
			g.context = cx;
			try {
				cb.call(self, null, result);
			} finally {
				g.context = oldContext;
			}
		}, function(err) {
			//trace && trace(err);
			var oldContext = g.context;
			g.context = cx;
			try {
				cb.call(self, err);
			} finally {
				g.context = oldContext;
			}
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