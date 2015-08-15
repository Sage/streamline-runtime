// Copyright 2011 Marcel Laverdet (code partially borrowed from original streamline fibers runtime)
"use strict";

var Fiber = require('fibers');
var util = require('./util');

var g = util.getGlobals('fibers');

exports.promisify = function fiberify(object, property, index) {
	var bound = typeof property !== "function";
	var fn = bound ? object[property] : property;
	if (typeof fn !== "function") throw util.typeError("cannot promisify function", "function", fn);
	var key = 'promised_' + index;
	var promised = fn[key];
	if (promised) return promised;

	promised = function promised() {
		var that = bound ? object : this;
		var args = Array.prototype.slice.call(arguments),
			arg = args[index];
		if (typeof arg !== 'boolean') throw util.argError("promised(" + fn.name + ")", index, 'boolean', arg);
		var cx = g.context;

		var fiber = Fiber.current;
		var err, val, yielded = false;
		args[index] = function(e, v) {
			//if (options && options.returnArray) v = Array.prototype.slice.call(arguments, 1);
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
		fn[key] = promised;
		promised['callbacked_' + index] = fn;
	}
	return promised;
};


exports.callbackify = function(fn, index) {
	if (typeof fn !== "function") throw util.typeError("cannot callbackify function", "function", fn);
	var key = 'callbacked_' + index;
	var callbacked = fn[key];
	if (callbacked) return callbacked;
	callbacked = function callbacked() {
		var that = this;
		var args = Array.prototype.slice.call(arguments);
		var cb = args[index];
		if (typeof cb !== "function") {
			// if cb is false, return a future
			if (cb === false) return future(null, callbacked.bind(self), args);
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
	callbacked['promised_' + index] = fn;
	fn[key] = callbacked;
	return callbacked;
}

exports.promisifyNew = function fiberifyNew(constructor, index) {
	if (typeof constructor !== "function") throw util.typeError("cannot promisify constructor", "function", constructor);
	var key = 'promisedNew_' + index;
	var promised = constructor[key];
	if (promised) return promised;

	promised = exports.promisify(null, function promisedNew() {
		var that = Object.create(constructor.prototype);
		constructor.apply(that, arguments);
		return that;
	}, index);

	constructor[key] = promised;
	return promised;
};

exports.future = require('./future');