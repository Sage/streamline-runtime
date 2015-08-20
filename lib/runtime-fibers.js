// Copyright 2011 Marcel Laverdet (code partially borrowed from original streamline fibers runtime)
"use strict";

var Fiber = require('fibers');
var util = require('./util');

var g = util.getGlobals('fibers');

exports.await = function(object, property, index1, index2, returnArray) {
	if (returnArray) console.error("GOT RETURNARRAY");
	var bound = typeof property !== "function";
	var fn = bound ? object[property] : property;
	if (typeof fn !== "function") throw util.typeError("cannot call", "function", fn);
	var key = 'awaitWrapper-' + index1 + '-' + index2 + '-' + returnArray;
	var wrapper = fn[key];
	if (wrapper) return bound ? wrapper.bind(object) : wrapper;

	wrapper = function() {
		var that = bound ? object : this;
		var args = Array.prototype.slice.call(arguments),
			arg = args[index1];
		if (typeof arg !== 'boolean') throw util.argError(fn.name, index1, 'boolean', arg);
		var cx = g.context;

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
				var oldContext = g.context;
				g.context = cx;
				try {
					if (e) {
						fiber.throwInto(e);
					} else {
						fiber.run(v);
					}
				} finally {
					g.context = oldContext;
				}
			}
		};
		if (index2 != null) {
			args[index1] = function(r) { callback(null, r); }
			args[index2] = function(e) { callback(e); }
		} else {
			args[index1] = callback;
		}

		// Invoke the function and yield
		fn.apply(that, args);
		if (yielded) {
			if (err) {
				throw err;
			}
			return val;
		}
		yielded = true;
		cx = g.context;
		try {
			return Fiber.yield();
		} catch (e) {
			throw e;
		}
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
	if (wrapper) return wrapper;
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
			var oldContext = g.context;
			g.context = cx;
			cx = null;
			try {
				val = fn.apply(lthat, largs);
			} catch (e) {
				err = e;
			} finally {			
				lcb(err, val);
				g.context = oldContext;				
			}
		}).run();
	};
	wrapper['awaitWrapper-' + index + '-null-false'] = fn;
	fn[key] = wrapper;
	return wrapper;
}

exports.new = function(constructor, index) {
	if (typeof constructor !== "function") throw util.typeError("cannot instantiate", "function", constructor);
	return function() {
		var that = Object.create(constructor.prototype);
		arguments[index] = true;
		exports.await(null, constructor, index, null, false).apply(that, arguments);
		return that;
	};
}

exports.future = require('./future');