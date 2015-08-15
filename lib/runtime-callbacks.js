"use strict";

exports.regeneratorRuntime = require('regenerator-runtime-only');
var Promise = require("bluebird");
// forceImmediate:
//	0 to disable
//	1 to force on every call
//	2 to force setImmediate instead of nextTick

var forceImmediate = 1; 
if (forceImmediate === 2) process.nextTick = setImmediate;

var glob = typeof global === "object" ? global : window;
var secret = "_20c7abceb95c4eb88b7ca1895b1170d1";
var g = (glob[secret] = (glob[secret] || {}));
if (g.runtime && g.runtime !== 'callbacks') console.warn("streamline: callbacks runtime loaded on top of " + g.runtime);

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
	return typeError("invalid argument " + index + " to function `" + fname + "`", expected, got) 
}

exports.promisify = function(object, property, index) {
	var bound = typeof property !== "function";
	var fn = bound ? object[property] : property;
	if (typeof fn !== "function") throw typeError("cannot promisify function", "function", fn);
	var key = 'promised_' + index;
	var promised = fn[key];
	if (promised) return promised;
	promised = function promised() {
		var args = Array.prototype.slice.call(arguments),
			arg = args[index];
		if (typeof arg !== 'boolean') throw argError("promised(" + fn.name + ")", index, 'boolean', arg);
		var cx = g.context;
		var promise = new Promise(function(resolve, reject) {
			args[index] = function(err, result) {
				if (err) trace && trace(err);
				if (sync || forceImmediate === 1) {
					setImmediate(function() {
						g.context = cx;
						if (err) reject(err);
						else resolve(result);					
					});
				} else {
					g.context = cx;
					if (err) reject(err);
					else resolve(result);										
				}
			};
		})
		var sync = true;
		fn.apply(bound ? object: this, args);
		sync = false;
		return promise;
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
		var self = this;
		var args = Array.prototype.slice.call(arguments);
		var cb = args[index];
		if (typeof cb !== "function") {
			// if cb is false, return a future
			if (cb === false) return future(null, callbacked.bind(self), args);
			throw argError(fn.name, index, "function", typeof cb);
		}
		var cx = g.context;
		fn.apply(this, args).then(function(result) {
			g.context = cx;
			cb.call(self, null, result);
		}, function(err) {
			trace && trace(err);
			g.context = cx;
			cb.call(self, err);
		});
	};
	callbacked['promised_' + index] = fn;
	fn[key] = callbacked;
	return callbacked;
}

exports.promisifyNew = function(constructor, index) {
	if (typeof constructor !== "function") throw typeError("cannot promisify constructor", "function", constructor);
	var key = 'promisedNew_' + index;
	var promised = constructor[key];
	if (promised) return promised;
	promised = function promisedNew() {
		var args = Array.prototype.slice.call(arguments);
		function promisedConstructor() {
			var self = this;
			var arg = args[index];
			if (arg !== true) throw argError(constructor.name, index, "true", arg);
			var self = this;
			var cx = g.context;
			var promise = new Promise(function(resolve, reject) {
				args[index] = function(err) {
					if (err) trace && trace(err);
					if (sync || forceImmediate === 1) {
						setImmediate(function() {
							g.context = cx;
							if (err) reject(err);
							else resolve(self);
						});
					} else {
						g.context = cx;
						if (err) reject(err);
						else resolve(self);						
					}
				};
			});
			var sync = true;
			constructor.apply(self, args);
			sync = false;
			return promise;
		}
		promisedConstructor.prototype = constructor.prototype;
		return new promisedConstructor();
	};
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
				if (sync || forceImmediate === 1) {
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
