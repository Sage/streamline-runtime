// Copyright 2011 Marcel Laverdet (code partially borrowed from original streamline fibers runtime)
"use strict";

var Fiber = require('fibers');
var util = require('./util');
var frameModule = require('./frame');

var g = util.getGlobals('fibers');

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
	var that = bound ? object : this;

	wrapper = function() {
		var args = Array.prototype.slice.call(arguments),
			arg = args[index1];
		if (typeof arg !== 'boolean') throw util.argError(fn.name, index1, 'boolean', arg);

		var fiber = Fiber.current;
		var err, val, yielded = false;
		var callback = function(e, v) {
				if (returnArray && !e) {
					v = Array.prototype.slice.call(arguments, 1);
				}
				if (!yielded) {
					yielded = true;
					err = e;
					val = v;
				} else {
					var context = g.context;
					var frame = g.frame;
					try {
						if (e) {
							fiber.throwInto(e);
						} else {
							fiber.run(v);
						}
					} finally {
						g.context = context;
						g.frame = frame;
					}
				}
			};
		if (index2 != null) {
			args[index1] = function(r) {
				callback(null, r);
			}
			args[index2] = function(e) {
				callback(e);
			}
		} else {
			args[index1] = callback;
		}

		// Invoke the function and yield
		var frame = g.emitter && frameModule.pushFrame(file, line, fn.name);
		fn.apply(that, args);

		if (yielded) {
			if (frame) frame.pop();
			if (err) throw err;
			return val;
		}
		yielded = true;

		var cx = g.context;
		try {
			if (frame) frame.yield();
			return Fiber.yield();
		} catch (e) {
			throw e;
		} finally {
			g.context = cx;
			g.frame = frame;
			if (frame) {
				frame.resume();
				frame.pop();
			}
		}

	}

	if (!bound) {
		fn[key] = wrapper;
		wrapper['asyncWrapper-' + index1] = fn;
	}
	return wrapper;
};

function arityWrapper(template) {
	var body = template.toString();
	body = body.substring(body.indexOf('{'));
	var cache = [];
	function makeArgs(i) {
		if (i <= 0) return "";
		return i > 1 ? makeArgs(i - 1) + ', a' + i : "a1";
	}
	function makeTransform(i) {
		return eval("(function(fn, index)" + body.replace(/function\s*\(\)/, "function(" + makeArgs(i) + ")") + ")");
	}
	return function(i) {
		return cache[i] || (cache[i] = makeTransform(i));
	}
}

var asyncTemplate = arityWrapper(function(fn, index) {
	var key = 'asyncWrapper-' + index;
	var wrapper = fn[key];
	if (wrapper) {
		counters.fastAsync++;
		return wrapper;
	}
	counters.slowAsync++;
	wrapper = function() {
		var that = this;
		var args = Array.prototype.slice.call(arguments);
		var cb = args[index];
		if (typeof cb !== "function") {
			// if cb is false, return a future
			if (cb === false) return future(null, wrapper.bind(self), args);
			throw util.argError(fn.name, index, "function", typeof cb);
		}
		// Start a new fiber
		var cx = g.context;
		var frame = g.frame;
		Fiber(function __streamline$run() {
			// copy variables from outer scope into locals and reset them
			// this avoids a serious memory leak.
			var largs = args;
			args = null;
			var lcb = cb;
			cb = null;
			var lthat = that;
			that = null;

			var val, err = null;
			g.context = cx;
			cx = null;
			try {
				val = fn.apply(lthat, largs);
			} catch (e) {
				err = e;
			} finally {
				lcb(err, val);
			}
		}).run();
		g.frame = frame;
	}
	wrapper['awaitWrapper-' + index + '-null-false'] = fn;
	fn[key] = wrapper;
	return wrapper;
});

exports.async = function(fn, index, arity) {
	if (typeof fn !== "function") throw util.typeError("cannot wrap function", "function", fn);
	return asyncTemplate(arity)(fn, index);
}

exports.new = function(file, line, constructor, index) {
	if (typeof constructor !== "function") throw util.typeError("cannot instantiate", "function", constructor);
	return function() {
		var that = Object.create(constructor.prototype);
		arguments[index] = true;
		exports.await(file, line, null, constructor, index, null, false).apply(that, arguments);
		return that;
	};
}

exports.future = require('./future');