// Copyright 2011 Marcel Laverdet
"use strict";

var Fiber = require('fibers');

var glob = typeof global === "object" ? global : window;
var secret = "_20c7abceb95c4eb88b7ca1895b1170d1";
var g = (glob[secret] = (glob[secret] || {}));

var trace = function(obj) {
	if (obj instanceof TypeError) console.error(obj.stack);
	//else console.error(obj);
};

function typeName(val) {
	return val === null ? "null" : typeof val;
}
function typeError(message, expected, got) {
	return new TypeError(message + ": expected " + expected + ", got " + typeName(got));
}
function argError(fname, index, expected, got) {
	console.error(new Error().stack);
	console.error("invalid argument " + index + " to function `" + fname + "`", expected, got);
	return typeError("invalid argument " + index + " to function `" + fname + "`", expected, got) 
}

exports.promisify = function fiberify(object, property, index) {
	var bound = typeof property !== "function";
	var fn = bound ? object[property] : property;
	if (typeof fn !== "function") throw typeError("cannot promisify function", "function", fn);
	var key = 'promised_' + index;
	var promised = fn[key];
	if (promised) return promised;

	promised = function promised() {
		var that = bound ? object : this;
		var args = Array.prototype.slice.call(arguments),
			arg = args[index];
		if (typeof arg !== 'boolean') throw argError("promised(" + fn.name + ")", index, 'boolean', arg);
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
	if (typeof fn !== "function") throw typeError("cannot callbackify function", "function", fn);
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
			throw argError(fn.name, index, "function", typeof cb);
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
	if (typeof constructor !== "function") throw typeError("cannot promisify constructor", "function", constructor);
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

exports.future = function(object, property, index) {
	var bound = typeof property !== "function";
	var fn = bound ? object[property] : property;
	if (typeof fn !== "function") throw new Error("cannot create future", "function", fn);
	return function futured() {
		var err, result, done, q = [],
			self = this;
		var args = Array.prototype.slice.call(arguments);
		var self = this;
		var cx = g.context;
		args[index] = function(e, r) {
			if (e) trace && trace(e);
			err = e;
			result = r;
			done = true;
			q && q.forEach(function(f) {
				if (sync) {
					setImmediate(function() {
						g.context = cx;
						f.call(bound ? object : self, e, r);
					});
				} else {
					g.context = cx;
					f.call(bound ? object : self, e, r);					
				}
			});
			q = null;
		};
		var sync = true;
		fn.apply(bound ? object : self, args);
		sync = false;
		return function future(cb) {
			if (cb === false) return future;
			if (typeof cb !== "function") throw argError(fn.name, index, "function", cb);
			if (done) {
				var cx = g.context;
				g.context = cx;
				cb.call(bound ? object : self, err, result);
			}
			else q.push(cb);
		};
	};
}
