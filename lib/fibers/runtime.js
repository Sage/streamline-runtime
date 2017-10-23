// Copyright 2011 Marcel Laverdet (code partially borrowed from original streamline fibers runtime)
"use strict";

var Fiber = require('fibers');
var util = require('../util');
var frameModule = require('../frame');

var g = util.getGlobals('fibers');

var keys = [];

function applyFast(fn, that, args) {
	switch (args.length) {
		case 1: return fn.call(that, args[0]);
		case 2: return fn.call(that, args[0], args[1]);
		case 3: return fn.call(that, args[0], args[1], args[2]);
		case 4: return fn.call(that, args[0], args[1], args[2], args[3]);
		default: return fn.apply(that, args);
	}
}

exports.await = function (file, line, object, property, index1, index2, returnArray, args) {
	var bound = typeof property !== "function";
	var fn = bound ? object[property] : property;
	if (typeof fn !== "function") throw util.typeError("cannot call", "function", fn);
	var key = '', wrapper;
	if (index2 == null && !returnArray) {
		key = keys[index1] || (keys[index1] = 'fiberized-' + index1);
		wrapper = fn[key];
		if (!wrapper && bound) {
			// second chance for foo.call(bar, _, ...). Optimize if bar.foo['fiberized-0'] exists
			if ((property === 'call') && index1 > 0 && typeof object === 'function') {
				var key2 = keys[index1 - 1] || (keys[index1 - 1] = 'fiberized-' + (index1 - 1));
				var fn2 = object[key2];
				if (fn2 && fn2[property]) {
					object = fn2;
					wrapper = fn2[property];
				}
			}
		}
		if (wrapper) {
			if (g.emitter) wrapper = frameModule.wrap(file, line, wrapper);
			// streamline < 2.0 does not pass args - return wrapper in this case
			if (Array.isArray(args)) return applyFast(wrapper, object, args);
			else return bound ? wrapper.bind(object) : wrapper;
		}
	}
	return awaitSlow(file, line, object, property, index1, index2, returnArray, args, bound, fn, key);
};

function awaitSlow(file, line, object, property, index1, index2, returnArray, args, bound, fn, key) {
	var that = bound ? object : this;

	var wrapper = function () {
		var args = Array.prototype.slice.call(arguments),
			arg = args[index1];
		if (typeof arg !== 'boolean') throw util.argError(fn.name, index1, 'boolean', arg);

		var fiber = Fiber.current;
		var err, val, yielded = false;
		var callback = function (e, v) {
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
					// reset all local variables to avoid memory leak
					context = null;
					frame = null;
				}
			}
		};
		if (index2 != null) {
			args[index1] = function (r) {
				callback(null, r);
			}
			args[index2] = function (e) {
				callback(e);
			}
		} else {
			args[index1] = callback;
		}

		// Invoke the function and yield
		var frame = g.emitter && frameModule.pushFrame(file, line, fn.name);
		applyFast(fn, that, args);

		if (yielded) {
			if (frame) frame.pop();
			if (err) throw wrapError(err);
			return val;
		}
		yielded = true;

		var cx = g.context;
		try {
			if (frame) frame.yield();
			return Fiber.yield();
		} catch (e) {
			throw wrapError(e);
		} finally {
			g.context = cx;
			g.frame = frame;
			if (frame) {
				frame.resume();
				frame.pop();
			}
			cx = null;
			frame = null;
		}

	}

	if (!bound && key) {
		fn[key] = wrapper;
	}
	return Array.isArray(args) ? applyFast(wrapper, object, args) : wrapper;
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
		if (process.versions.modules >= 46) {
			return function (fn, index) {
				var f = template(fn, index);
				Object.defineProperty(f, "length", { value: i });
				return f;
			};
		} else {
			return eval("(function wrapper(fn, index)" + body.replace(/function\s*wrapper\(\)/, "function wrapper(" + makeArgs(i) + ")") + ")");
		}
	}
	return function (i) {
		return cache[i] || (cache[i] = makeTransform(i));
	}
}

var asyncTemplate = arityWrapper(function (fn, index) {
	var wrapper = function wrapper() {
		var that = this;
		var args = Array.prototype.slice.call(arguments);
		var cb = args[index];
		if (typeof cb !== "function") {
			if (g.allowBooleanPlaceholders && typeof cb === 'boolean') {
				if (cb) cb = util.defaultCallback;
				else return exports.future("", 0, null, wrapper.bind(this), index)(args);
			}
			else throw util.argError(fn.name, index, "function", typeof cb);
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
			try {
				val = applyFast(fn, lthat, largs);
			} catch (e) {
				err = e;
			} finally {
				lcb(err, val);
			}
		}).run();
		g.context = cx;
		g.frame = frame;
	}
	wrapper['fiberized-' + index] = fn;
	return wrapper;
});

exports.async = function (fn, index, arity) {
	if (typeof fn !== "function") throw util.typeError("cannot wrap function", "function", fn);
	return asyncTemplate(arity)(fn, index);
}

exports.new = function (file, line, constructor, index) {
	if (typeof constructor !== "function") throw util.typeError("cannot instantiate", "function", constructor);
	return function () {
		var that = Object.create(constructor.prototype);
		arguments[index] = true;
		applyFast(exports.await(file, line, null, constructor, index, null, false), that, arguments);
		return that;
	};
}

function wrapError(e) {
	if (!(e instanceof Error)) return e;
	var extra = { message: "__streamline$extra" };
	Error.captureStackTrace(extra);
	var ne = Object.create(e);
	Object.defineProperty(ne, 'stack', {
		get: function () {
			return (e.stack + (extra ? extra.stack : "")).split('\n').filter(function (frame) {
				return !/\bstreamline-runtime.lib\b/.test(frame) &&
					frame.indexOf('__streamline$') < 0;
			}).join('\n');
		},
		enumerable: true,
	});
	return ne;
}

exports.future = require('../future');
require('./builtins');

Function.prototype.apply_['fiberized-0'] = function (dummy, thisObj, args, index) {
	if (this['fiberized-0']) {
		args = Array.prototype.slice.call(args, 0);
		args.splice(index != null && index >= 0 ? index : args.length, 0, dummy);
		return applyFast(this['fiberized-0'], thisObj, args);
	} else {
		return Function.prototype.apply_.call(this, dummy, thisObj, args, index);
	}
}